import { Card, CardContent } from '@/components/ui/card';
import { Message } from '@/pages/hooks';
import Markdown from './MessageItem';

type ContentItem =
    | { type: 'text'; text: string }
    | { type: 'image'; image: string };

interface MessageItemProps {
    message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
    return (
        <Card className={`mb-4 ${message.role === 'user' ? 'ml-auto  max-w-[80%]' : ''}`}        >
            <CardContent className={`p-3 ${message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/50'}`}            >
                {message.role === 'assistant' && (
                    <Markdown content={message.content as string} />
                )}

                {message.role === 'user' &&
                    (message.content as ContentItem[]).map((item, idx) => (
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
                    ))}
            </CardContent>
        </Card>
    );
}
