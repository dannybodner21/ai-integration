import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { claudeAPI, ClaudeMessage } from '@/services/claudeApi';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatProps {
  onExpandedChange?: (expanded: boolean) => void;
}

const AIChat = ({ onExpandedChange }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
      // Smooth scroll the page to accommodate the expanded chat
      setTimeout(() => {
        const chatElement = document.querySelector('.banner-container');
        if (chatElement) {
          chatElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100); // Small delay to ensure animation starts
    }
    // Notify parent component of expanded state change
    onExpandedChange?.(isExpanded);
  }, [messages, isExpanded, onExpandedChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Expand the chat if this is the first message
    if (!isExpanded) {
      setIsExpanded(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Claude API is now handled by backend

      // Convert messages to Claude format
      const conversationHistory: ClaudeMessage[] = messages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes("I'm sorry, I encountered an error"))
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Get response from Claude API
      const systemPrompt = `You are an AI business consultant specializing in custom AI & SaaS tools. When a user describes their business, provide exactly 3 specific, actionable ways they can implement AI to save money and increase efficiency. Focus on:

1. **Cost Reduction**: How AI can automate expensive manual processes
2. **Time Savings**: How AI can eliminate 30-50% of wasted hours
3. **Revenue Generation**: How AI can create new profit opportunities

Be specific, practical, and mention concrete AI tools or approaches. Keep each suggestion concise but actionable. Format your response with clear numbered points.`;

      const response = await claudeAPI.chat(inputValue, conversationHistory, systemPrompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "I'm sorry, I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleInputFocus - no longer auto-expands on focus

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Messages Container */}
            <div className="bg-black/80 border-2 border-black rounded-xl p-4 mb-4 h-48 overflow-y-auto shadow-sm relative w-full">
              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-2 right-2 p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full transition-colors z-10"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-800 text-white'
                        }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-orange-100' : 'text-gray-300'
                        }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start mb-4"
                >
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-[#242424] border-2 border-black rounded-xl p-4 shadow-sm w-full">
          <div className="text-xs text-gray-400 mb-2 text-center">
            💡 Describe your business type, size, and current pain points for personalized AI solutions
          </div>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim() && !isLoading) {
                  handleSubmit(e as any);
                }
              }
            }}
            placeholder="Describe your business (industry, size, current challenges) — we'll instantly reveal 3 AI solutions to save you money..."
            className="w-full resize-none border-none outline-none text-white placeholder-gray-400 text-sm caret-orange-500 bg-transparent"
            rows={3}
            disabled={isLoading}
            autoFocus
          />

          {/* Send Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
