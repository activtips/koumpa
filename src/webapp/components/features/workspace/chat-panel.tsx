'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { ProjectStatus } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isGenerating: boolean;
  projectStatus?: ProjectStatus;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isGenerating,
  projectStatus,
}: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-[400px] min-w-[350px] max-w-[500px] bg-dark-850 border-r border-dark-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-dark-50 font-medium">Conversation</h2>
        <p className="text-sm text-dark-400 mt-1">
          Decrivez les modifications souhaitees
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.role === 'user'
                    ? 'bg-primary-500/20'
                    : 'bg-secondary-500/20'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-primary-400" />
                ) : (
                  <Bot className="w-4 h-4 text-secondary-400" />
                )}
              </div>

              {/* Message content */}
              <div
                className={cn(
                  'flex-1 max-w-[85%]',
                  message.role === 'user' ? 'text-right' : ''
                )}
              >
                <div
                  className={cn(
                    'inline-block px-4 py-2.5 rounded-2xl text-sm',
                    message.role === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-dark-700 text-dark-100 rounded-tl-sm'
                  )}
                >
                  {message.content}
                </div>
                <p className="text-xs text-dark-500 mt-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Generating indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-secondary-400" />
            </div>
            <div className="bg-dark-700 px-4 py-2.5 rounded-2xl rounded-tl-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />
                <span className="text-sm text-dark-300">En cours de reflexion...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-700">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              projectStatus === 'generating'
                ? 'Generation en cours...'
                : 'Decrivez une modification...'
            }
            disabled={isGenerating || projectStatus === 'generating'}
            rows={1}
            className={cn(
              'w-full bg-dark-800 border border-dark-600 rounded-xl',
              'px-4 py-3 pr-12 resize-none',
              'text-dark-50 placeholder:text-dark-500',
              'focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating || projectStatus === 'generating'}
            className={cn(
              'absolute right-2 bottom-2 p-2 rounded-lg',
              'bg-primary-500 text-white',
              'hover:bg-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-dark-500 mt-2">
          Appuyez sur Entree pour envoyer, Shift+Entree pour un retour a la ligne
        </p>
      </form>
    </div>
  );
}
