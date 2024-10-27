import { useState, useCallback, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from './hooks';
import { useToast } from '@/hooks/use-toast';
import AttachmentPreview, { AttachedFile } from '@/components/AttachmentPreview';
import MessageItem from '@/components/MessageItem';
import MessageInput from '@/components/MessageInput';

export default function Chat() {
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const { messages, sendMessage, loading, abort } = useChat();
    const { toast } = useToast();

    const handleSend = useCallback(
        (input: string, files: File[]) => {
            if (input.trim() || files.length > 0) {
                sendMessage(input, files);
            } else {
                toast({
                    title: 'Mensaje vacío',
                    description: 'No puedes enviar un mensaje vacío',
                    variant: 'destructive',
                });
            }
        },
        [sendMessage, toast]
    );

    const removeFile = useCallback((index: number) => {
        setAttachedFiles((prev) => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    }, []);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-screen text-foreground">
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full p-4">
                    {messages.map((message, index) => (
                        <MessageItem key={index} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                </ScrollArea>
            </div>
            <div className="p-4 border-t">
                <div className="relative flex items-center max-w-3xl mx-auto">
                    <div className="relative flex-1 flex flex-col">
                        {attachedFiles.length > 0 && (
                            <AttachmentPreview
                                attachedFiles={attachedFiles}
                                removeFile={removeFile}
                            />
                        )}
                        <MessageInput
                            onSend={handleSend}
                            loading={loading}
                            abort={abort}
                            attachedFiles={attachedFiles}
                            setAttachedFiles={setAttachedFiles}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
