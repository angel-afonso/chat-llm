import { X } from 'lucide-react';

export type AttachedFile = {
    file: File;
    preview: string;
};

interface AttachmentPreviewProps {
    attachedFiles: AttachedFile[];
    removeFile: (index: number) => void;
}

export default function AttachmentPreview({ attachedFiles, removeFile, }: AttachmentPreviewProps) {
    return (
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
    );
};


