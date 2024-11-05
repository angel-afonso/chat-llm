// MessageInput.tsx
import React, { useRef, useState, useCallback } from 'react';
import { Paperclip, Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AttachedFile } from './AttachmentPreview';

interface MessageInputProps {
    onSend: (input: string, files: File[]) => void;
    loading: boolean;
    abort: () => void;
    attachedFiles: AttachedFile[];
    setAttachedFiles: React.Dispatch<React.SetStateAction<AttachedFile[]>>;
}

export default function MessageInput({
    onSend,
    loading,
    abort,
    attachedFiles,
    setAttachedFiles,
}: MessageInputProps) {
    const [input, setInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleSend = useCallback(() => {
        if (input.trim() || attachedFiles.length > 0) {
            onSend(input, attachedFiles.map((file) => file.file));
            setInput('');
            setAttachedFiles([]);
        }
    }, [input, attachedFiles, onSend, setAttachedFiles]);

    const handleImageAttach = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files || []);
            const invalidFiles = files.filter(
                (file) => !file.type.startsWith('image/')
            );

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
        [toast, setAttachedFiles]
    );

    const handleKeyUp = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    return (
        <>
            <div className="relative flex items-center border rounded-lg">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleImageAttach}
                    // className="absolute left-2 z-10"
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
                    className="min-h-[44px] px-1 py-3 max-h-[200px] resize-none border-0 outline-none focus:outline-none"
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
                    // className="absolute right-2 z-10"
                    aria-label={!loading ? 'Enviar mensaje' : 'Abortar envío'}
                >
                    {!loading ? (
                        <Send className="h-4 w-4" />
                    ) : (
                        <Square className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </>
    );
};


