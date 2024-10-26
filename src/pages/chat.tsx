import { useRef, useState, useCallback } from 'react';
import { Paperclip, Send, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useChat } from './hooks';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type ContentItem =
    | { type: 'text'; text: string }
    | { type: 'image'; image: string };

type UserMessage = {
    role: 'user';
    content: ContentItem[];
};

type AssistantMessage = {
    role: 'assistant';
    content: string;
};

type Message = UserMessage | AssistantMessage;

type AttachedFile = {
    file: File;
    preview: string;
};

export default function Chat() {
    const [input, setInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const { messages, sendMessage, loading, abort } = useChat();

    const handleSend = useCallback(() => {
        if (input.trim() || attachedFiles.length > 0) {
            sendMessage(input, attachedFiles.map((file) => file.file));
            setInput('');
            setAttachedFiles([]);
        }
    }, [input, attachedFiles, sendMessage]);

    const handleImageAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));

            if (invalidFiles.length > 0) {
                toast({
                    title: 'Tipo de archivo inválido',
                    description: 'Por favor, selecciona solo archivos de imagen',
                    variant: 'destructive',
                });
                return;
            }

            const newFiles = files.map((file) => ({
                file,
                preview: URL.createObjectURL(file),
            }));

            setAttachedFiles((prev) => [...prev, ...newFiles]);

            toast({
                title: '¡Imágenes adjuntadas con éxito!',
                description: `${files.length} imagen(es) añadida(s)`,
                variant: 'default',
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        [toast]
    );

    const removeFile = useCallback((index: number) => {
        setAttachedFiles((prev) => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    }, []);

    const handleKeyUp = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    console.log(messages)

    return (
        <div className="flex flex-col h-screen text-foreground">
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full p-4">
                    {messages.map((message, index) => (
                        <Card
                            key={index}
                            className={`mb-4 ${message.role === 'user' ? 'ml-auto' : 'mr-auto'
                                } max-w-[80%]`}
                        >
                            <CardContent
                                className={`p-3 ${message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/50'
                                    }`}
                            >
                                {message.role === 'assistant' && <p>{message.content as string}</p>}
                                {
                                    message.role === 'user' && (
                                        message.content as ContentItem[]).map((item, idx) => (
                                            <div key={idx} className="mb-1">
                                                {item.type === 'text' ? (
                                                    <p>{item.text}</p>
                                                ) : item.type === 'image' ? (
                                                    <img
                                                        src={item.image}
                                                        alt="Imagen adjunta"
                                                        className="max-w-full h-auto rounded"
                                                    />
                                                ) : null}
                                            </div>
                                        ))
                                }

                            </CardContent>
                        </Card>
                    ))}
                </ScrollArea>
            </div>
            <div className="p-4 border-t">
                <div className="relative flex items-center max-w-3xl mx-auto">
                    <div className="relative flex-1 flex flex-col">
                        {attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2 px-10">
                                {attachedFiles.map((file, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={file.preview}
                                            alt={file.file.name}
                                            className="h-20 w-20 object-cover rounded-md"
                                        />
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label="Eliminar imagen"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="relative flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleImageAttach}
                                className="absolute left-2 z-10"
                                aria-label="Adjuntar imagen"
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                            <Textarea
                                disabled={loading}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                onKeyUp={handleKeyUp}
                                className="min-h-[44px] pl-10 pr-12 py-3 max-h-[200px] resize-none rounded-lg focus:ring-1 focus:ring-primary/20"
                                style={{ height: 'auto', overflow: 'hidden' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = `${Math.min(
                                        target.scrollHeight,
                                        200
                                    )}px`;
                                }}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={!loading ? handleSend : abort}
                                className="absolute right-2 z-10"
                                aria-label={!loading ? 'Enviar mensaje' : 'Abortar envío'}
                            >
                                {!loading ? (
                                    <Send className="h-4 w-4" />
                                ) : (
                                    <Square className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
