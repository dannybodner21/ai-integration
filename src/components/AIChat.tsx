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
      // Check if Claude API is configured
      if (!claudeAPI.isConfigured()) {
        throw new Error('Claude API not configured. Please set your API key.');
      }

      // Convert messages to Claude format
      const conversationHistory: ClaudeMessage[] = messages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes("I'm sorry, I encountered an error"))
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Get response from Claude API
      const systemPrompt = `You are an AI assistant specializing in custom AI & SaaS tools, business automation, and process optimization. You help businesses understand how to implement AI solutions that can save 30-50% of wasted hours and create new revenue streams. Be helpful, professional, and provide actionable insights. Keep responses concise but informative.`;
      
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
            <div className="bg-white rounded-xl p-4 mb-4 h-48 overflow-y-auto shadow-sm relative">
              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full transition-colors z-10"
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
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-orange-100' : 'text-gray-500'
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
                  <div className="bg-gray-100 p-3 rounded-lg">
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
        <div className="bg-white rounded-xl p-4 shadow-sm">
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
            placeholder="Tell us about your business — we'll instantly reveal 3 simple ways AI can boost it today..."
            className="w-full resize-none border-none outline-none text-gray-800 placeholder-gray-400 text-sm caret-orange-500"
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
