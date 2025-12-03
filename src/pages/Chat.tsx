
import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your OnePoint ALO assistant. I can help you create needs, find providers, and manage your tasks. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Generate a contextual AI response using simple pattern matching
      const userInput = userMessage.content.toLowerCase();
      let assistantContent = '';

      // Pattern-based responses for common queries
      if (userInput.includes('need') || userInput.includes('create')) {
        assistantContent = "I'd be happy to help you create a need! You can specify what task you need help with, provide details about your requirements, and I'll help you connect with the right service provider. What kind of help do you need?";
      } else if (userInput.includes('provider') || userInput.includes('find')) {
        assistantContent = "You can browse available service providers on the Providers page. They're verified and highly rated. Just review their qualifications and accept the ones that match your needs!";
      } else if (userInput.includes('price') || userInput.includes('cost') || userInput.includes('budget')) {
        assistantContent = "Pricing depends on the type of service and your location. Each provider sets their own rates, which you'll see before confirming. I recommend comparing a few providers to find the best value for your needs.";
      } else if (userInput.includes('help') || userInput.includes('how')) {
        assistantContent = "I'm here to help! You can:\n1. Create Needs - Tell me what tasks you need help with\n2. Browse Providers - Find verified service providers\n3. Track Progress - Monitor your needs and their status\n4. Chat with me - Ask any questions about the platform\n\nWhat would you like help with?";
      } else if (userInput.includes('thank')) {
        assistantContent = "You're welcome! Let me know if you need anything else. I'm always here to help!";
      } else {
        assistantContent = "That's interesting! You can use OnePoint ALO to manage your daily tasks and connect with local service providers. Would you like to create a need, explore providers, or learn more about how the platform works?";
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col px-4 py-4 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              data-testid={`chat-message-${index}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-primary' 
                  : 'bg-accent/20'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-accent" />
                )}
              </div>
              
              <div className={`glass-card rounded-2xl p-4 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary/20 border-primary/30' 
                  : ''
              }`}>
                <p className="text-sm text-foreground whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div className="glass-card rounded-2xl p-4">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass-card rounded-2xl p-3 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 bg-background/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-white"
            data-testid="chat-input"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            className="rounded-xl bg-primary hover:bg-primary/90 h-10 w-10"
            data-testid="chat-send-btn"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
