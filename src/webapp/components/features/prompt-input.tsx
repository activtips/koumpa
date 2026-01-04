'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

const suggestions = [
  'Une app de gestion de taches avec Kanban',
  'Un portfolio moderne pour developpeur',
  'Une landing page pour startup SaaS',
  'Un dashboard analytique avec graphiques',
  'Un blog personnel avec markdown',
];

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'Decrivez l\'application que vous voulez creer...',
}: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main Input Container */}
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 2px rgba(249, 115, 22, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        className={cn(
          'relative rounded-2xl overflow-hidden',
          'bg-dark-800 border border-dark-700',
          'transition-colors duration-200',
          isFocused && 'border-primary-500/50'
        )}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity" />

        <div className="relative p-4">
          {/* Label */}
          <div className="flex items-center gap-2 mb-3 text-dark-400">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium">Propulse par Claude AI</span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className={cn(
              'w-full bg-transparent resize-none',
              'text-lg text-dark-50 placeholder:text-dark-500',
              'focus:outline-none',
              'min-h-[60px]'
            )}
          />

          {/* Bottom Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
            <p className="text-xs text-dark-500">
              Appuyez sur Entree pour generer
            </p>
            <button
              onClick={onSubmit}
              disabled={isLoading || !value.trim()}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl',
                'bg-gradient-to-r from-primary-500 to-primary-600',
                'text-white font-medium',
                'transition-all duration-200',
                'hover:from-primary-600 hover:to-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-lg shadow-primary-500/25'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generation...
                </>
              ) : (
                <>
                  Generer
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Suggestions */}
      <div className="mt-6">
        <p className="text-dark-400 text-sm mb-3 text-center">Essayez par exemple :</p>
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm',
                'bg-dark-800/50 border border-dark-700',
                'text-dark-300 hover:text-dark-50',
                'hover:border-primary-500/50 hover:bg-dark-800',
                'transition-all duration-200'
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
