import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
    text: string;
    sender: 'user' | 'ai';
}

const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, { text: input, sender: 'user' }]);
            // Simulate AI response
            setTimeout(() => {
                setMessages(prev => [...prev, { text: `Response to: ${input}`, sender: 'ai' }]);
            }, 1000);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-screen text-foreground">
            <div className="flex-grow overflow-hidden">
                <ScrollArea className="h-full p-4">
                    {messages.map((message, index) => (
                        <Card key={index} className={`mb-4 ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}>
                            <CardContent className={`p-3 ${message.sender === 'user' ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                                {message.text}
                            </CardContent>
                        </Card>
                    ))}
                </ScrollArea>
            </div>
            <div className="p-4 border-t">
                <div className="flex space-x-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyUp={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button variant='default' onClick={handleSend}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Chat;