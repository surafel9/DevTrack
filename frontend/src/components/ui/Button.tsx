import React from 'react';

function cls(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-gray-900 text-white border-gray-900 hover:bg-gray-800 shadow-sm',
  secondary: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm',
  ghost:     'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900',
  danger:    'bg-white text-red-600 border-red-200 hover:bg-red-50 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:   'h-8 px-3 text-sm gap-1.5',
  md:   'h-9 px-4 text-sm gap-2',
  lg:   'h-10 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0 justify-center',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cls(
          'inline-flex items-center justify-center font-medium border rounded-lg transition-colors select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
