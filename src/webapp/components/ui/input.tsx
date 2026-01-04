import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, error, ...props }, ref) {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-lg',
            'bg-dark-800 border border-dark-600',
            'text-dark-50 placeholder:text-dark-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
            error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
