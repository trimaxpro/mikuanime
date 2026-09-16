import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-body font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-card focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-accent-primary text-white font-semibold hover:bg-[#2bf7dd] hover:shadow-glow active:scale-[0.98]': variant === 'primary',
            'bg-elevated text-text-primary border border-border-subtle hover:border-border-glow hover:bg-surface': variant === 'secondary',
            'bg-transparent text-text-secondary hover:text-text-primary hover:bg-elevated/50': variant === 'ghost',
          },
          {
            'h-8 px-3 text-sm gap-1.5': size === 'sm',
            'h-10 px-4 text-sm gap-2': size === 'md',
            'h-12 px-6 text-base gap-2.5': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export { Button, type ButtonProps };
