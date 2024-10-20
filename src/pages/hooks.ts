import { useState, useCallback, useRef } from 'react';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const ollama = createOpenAI({
    apiKey: 'sk-1234567890',
    baseURL: 'http://localhost:11434/v1/'
});

export function useChat() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);

    const controllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (newMessage: string) => {
        if (!newMessage || !newMessage.trim()) {
            setError('Invalid input: newMessage must be a non-empty string');
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
            const res = await streamText({
                model: ollama('llama3.2'),
                messages: [...messages, { role: 'user', content: newMessage }],
                abortSignal: abortController.signal,
            });

            setMessages((prev) => [...prev, { role: 'user', content: newMessage }]);

            for await (const chunk of res.textStream) {
                if (abortController.signal.aborted) {
                    break;
                }

                setMessages((prevMessages) => {
                    const messages = [...prevMessages];
                    const lastMessage = messages[messages.length - 1];

                    if (lastMessage?.role === 'assistant') {
                        messages[messages.length - 1] = { ...lastMessage, content: lastMessage.content + chunk };
                    } else {
                        messages.push({ role: 'assistant', content: chunk });
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
    }, [messages]);

    const abort = useCallback(() => {
        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
            setLoading(false);
        }
    }, []);

    return { loading, error, sendMessage, messages, abort };
}