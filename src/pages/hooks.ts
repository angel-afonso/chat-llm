import { useState, useCallback, useRef } from 'react';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, UserContent, CoreMessage } from 'ai';


const ollama = createOpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'http://localhost:11434/v1/',
});

export function useChat() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<CoreMessage[]>([]);

    const controllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(
        async (newMessage: string, images?: File[]) => {
            if (
                (!newMessage || !newMessage.trim()) &&
                (!images || images.length === 0)
            ) {
                setError('Invalid input: message and images cannot both be empty');
                return;
            }

            if (controllerRef.current) {
                controllerRef.current.abort();
            }

            const abortController = new AbortController();
            controllerRef.current = abortController;

            setLoading(true);
            setError(null);

            try {
                const content: UserContent = [];

                if (newMessage.trim()) {
                    content.push({ type: 'text', text: newMessage.trim() });
                }

                if (images && images.length > 0) {
                    for (const image of images) {
                        const reader = new FileReader();
                        const imageDataUrl = await new Promise<string>((resolve, reject) => {
                            reader.onload = () => resolve(reader.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(image);
                        });


                        content.push({ type: 'image', image: imageDataUrl });
                    }
                }

                const userMessage: CoreMessage = {
                    role: 'user',
                    content,
                }

                const newState = [...messages, userMessage];

                setMessages(newState);

                const res = await streamText({
                    model: ollama('llama3.2:11b'),
                    messages: newState,
                    abortSignal: abortController.signal,
                });


                let assistantContent = '';

                for await (const chunk of res.textStream) {
                    if (abortController.signal.aborted) {
                        break;
                    }

                    assistantContent += chunk;

                    setMessages((prevMessages) => {
                        const messages = [...prevMessages];
                        const lastMessage = messages[messages.length - 1];

                        if (lastMessage?.role === 'assistant') {
                            messages[messages.length - 1] = {
                                ...lastMessage,
                                content: assistantContent,
                            };
                        } else {
                            messages.push({
                                role: 'assistant',
                                content: assistantContent,
                            });
                        }
                        return messages;
                    });
                }
            } catch (err: any) {
                if (err.name === 'AbortError') {
                    console.log('Request aborted');
                } else if (err.response) {
                    setError(`API Error: ${err.response.status} - ${err.response.data}`);
                } else if (err.request) {
                    setError('Network Error: No response received from the server');
                } else {
                    setError(`Error: ${err.message}`);
                }
            } finally {
                setLoading(false);
                if (controllerRef.current === abortController) {
                    controllerRef.current = null;
                }
            }
        },
        [messages]
    );

    const abort = useCallback(() => {
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
            setLoading(false);
        }
    }, []);

    return { loading, error, sendMessage, messages, abort };
}
