import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useChat } from './hooks';

const Chat = () => {
    const [input, setInput] = useState('');

    const { messages, sendMessage, loading } = useChat();

    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-screen text-foreground">
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full p-4">
                    {messages.map((message, index) => (
                        <Card key={index} className={`mb-4 ${message.role === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}>
                            <CardContent className={`p-3 ${message.role === 'user' ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                                {message.content}
                            </CardContent>
                        </Card>
                    ))}
                </ScrollArea>
            </div>
            <div className="p-4 border-t">
                <div className="flex space-x-2">
                    <Input
                        disabled={loading}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyUp={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button variant='secondary' onClick={handleSend}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Chat;