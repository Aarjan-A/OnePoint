import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'user' | 'provider';
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  provider: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  need: {
    id: string;
    title: string;
    category: string;
  };
  messages: ChatMessage[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

// Demo conversations
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    provider: {
      id: 'p1',
      name: 'Swift Plumbing Services',
      avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100',
      rating: 4.9,
    },
    need: {
      id: 'n1',
      title: 'Fix Leaky Faucet',
      category: 'Plumbing',
    },
    messages: [
      {
        id: 'm1',
        sender: 'provider',
        senderName: 'Swift Plumbing',
        content: 'Hi! I can help you fix that leaky faucet. When would you like me to visit?',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true,
      },
      {
        id: 'm2',
        sender: 'user',
        senderName: 'You',
        content: 'Today afternoon would be perfect. I am at home after 2 PM.',
        timestamp: new Date(Date.now() - 3500000),
        isRead: true,
      },
      {
        id: 'm3',
        sender: 'provider',
        senderName: 'Swift Plumbing',
        content: 'Great! I will be there at 3 PM. Please prepare access to your bathroom.',
        timestamp: new Date(Date.now() - 3400000),
        isRead: true,
      },
    ],
    lastMessage: 'Great! I will be there at 3 PM. Please prepare access to your bathroom.',
    lastMessageTime: new Date(Date.now() - 3400000),
    unreadCount: 0,
  },
  {
    id: '2',
    provider: {
      id: 'p2',
      name: 'Elite Electricians',
      avatar: 'https://images.unsplash.com/photo-1552058544-f6b08422138a?w=100',
      rating: 4.8,
    },
    need: {
      id: 'n2',
      title: 'Install New Lighting',
      category: 'Electrical',
    },
    messages: [
      {
        id: 'm4',
        sender: 'provider',
        senderName: 'Elite Electricians',
        content: 'Hi there! Received your request for lighting installation.',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true,
      },
      {
        id: 'm5',
        sender: 'user',
        senderName: 'You',
        content: 'Thanks for reaching out. Can you send me a quote?',
        timestamp: new Date(Date.now() - 6800000),
        isRead: true,
      },
    ],
    lastMessage: 'Thanks for reaching out. Can you send me a quote?',
    lastMessageTime: new Date(Date.now() - 6800000),
    unreadCount: 0,
  },
];

export default function ChatProviderNeeds() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const newMessage: ChatMessage = {
        id: `m${Date.now()}`,
        sender: 'user',
        senderName: 'You',
        content: messageInput,
        timestamp: new Date(),
        isRead: false,
      };

      setConversations(
        conversations.map((conv) => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: messageInput,
              lastMessageTime: new Date(),
            };
          }
          return conv;
        })
      );

      setSelectedConversation({
        ...selectedConversation,
        messages: [...selectedConversation.messages, newMessage],
        lastMessage: messageInput,
        lastMessageTime: new Date(),
      });

      setMessageInput('');

      // Simulate provider response after 2 seconds
      setTimeout(() => {
        const providerResponse: ChatMessage = {
          id: `m${Date.now() + 1}`,
          sender: 'provider',
          senderName: selectedConversation.provider.name,
          content: 'Thanks for your message. I will get back to you shortly.',
          timestamp: new Date(),
          isRead: false,
        };

        setConversations(
          conversations.map((conv) => {
            if (conv.id === selectedConversation.id) {
              return {
                ...conv,
                messages: [...conv.messages, providerResponse],
              };
            }
            return conv;
          })
        );

        setSelectedConversation((prev) => {
          if (prev) {
            return {
              ...prev,
              messages: [...prev.messages, providerResponse],
            };
          }
          return prev;
        });
      }, 2000);
    } finally {
      setIsSending(false);
    }
  };

  // Conversations list view
  if (!selectedConversation) {
    return (
      <div className="min-h-screen pb-24 flex flex-col">
        <Navigation />
        
        <div className="flex-1 flex flex-col px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
          
          {conversations.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center flex-1 flex items-center justify-center">
              <div>
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-1">Accept a provider to start messaging</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className="glass-card-hover rounded-2xl p-4 w-full text-left transition-all"
                  data-testid={`conversation-item-${conversation.id}`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={conversation.provider.avatar}
                      alt={conversation.provider.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-foreground truncate">
                          {conversation.provider.name}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {conversation.lastMessageTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-accent font-medium mb-1">{conversation.need.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{conversation.unreadCount}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Single conversation view
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Header */}
      <div className="glass-card border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="back-to-conversations"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img
            src={selectedConversation.provider.avatar}
            alt={selectedConversation.provider.name}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100`;
            }}
          />
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {selectedConversation.provider.name}
            </h2>
            <p className="text-xs text-accent">{selectedConversation.need.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors" title="Call">
            <Phone className="w-5 h-5 text-primary" />
          </button>
          <button className="w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center transition-colors" title="Video call">
            <Video className="w-5 h-5 text-primary" />
          </button>
          <button className="w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors" title="More options">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
        {selectedConversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            data-testid={`message-${message.id}`}
          >
            <div
              className={`max-w-[70%] glass-card rounded-2xl p-4 ${
                message.sender === 'user'
                  ? 'bg-primary/20 border-primary/30'
                  : ''
              }`}
            >
              <p className="text-sm text-foreground">{message.content}</p>
              <span className="text-xs text-muted-foreground mt-2 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card border-t border-border/50 fixed bottom-20 left-0 right-0 px-4 py-3">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 bg-background/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 text-white rounded-xl"
            data-testid="message-input"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !messageInput.trim()}
            size="icon"
            className="rounded-xl bg-primary hover:bg-primary/90 h-10 w-10"
            data-testid="send-message-btn"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { MessageCircle } from 'lucide-react';
