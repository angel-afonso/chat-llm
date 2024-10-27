import { Card, CardContent } from '@/components/ui/card';
import { Message } from '@/pages/hooks';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; // For syntax highlighting
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

type ContentItem =
    | { type: 'text'; text: string }
    | { type: 'image'; image: string };

interface MessageItemProps {
    message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
    return (
        <Card
            className={`mb-4 ${message.role === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
        >
            <CardContent
                className={`p-3 ${message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/50'
                    }`}
            >
                {message.role === 'assistant' && (
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ node, ...props }) => (
                                <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2 className="text-xl font-bold mt-3 mb-1" {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 className="text-lg font-bold mt-2 mb-1" {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <p className="mb-2 leading-relaxed" {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside mb-2 pl-4" {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol className="list-decimal list-inside mb-2 pl-4" {...props} />
                            ),
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            blockquote: ({ node, ...props }) => (
                                <blockquote
                                    className="border-l-4 border-gray-300 pl-4 italic mb-2 text-gray-600"
                                    {...props}
                                />
                            ),
                            code: ({ node, className, children, ...props }) => {
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <SyntaxHighlighter
                                        style={dracula}
                                        language={match[1]}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code
                                        className="rounded px-1 py-0.5 text-sm"
                                        {...props}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            a: ({ node, ...props }) => (
                                <a className="text-blue-600 hover:underline" {...props} />
                            ),
                            img: ({ node, ...props }) => (
                                <img
                                    className="max-w-full h-auto rounded mb-2"
                                    alt={props.alt || 'Image'}
                                    {...props}
                                />
                            ),
                            table: ({ node, ...props }) => (
                                <table className="table-auto w-full mb-4" {...props} />
                            ),
                            th: ({ node, ...props }) => (
                                <th
                                    className="px-4 py-2 border-b text-left bg-gray-100"
                                    {...props}
                                />
                            ),
                            td: ({ node, ...props }) => (
                                <td className="px-4 py-2 border-b" {...props} />
                            ),
                        }}
                    >
                        {message.content as string || 'Loading...'}
                    </ReactMarkdown>
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
