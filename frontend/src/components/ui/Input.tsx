import React from 'react';

function cls(...c: (string | undefined | false | null)[]) {
  return c.filter(Boolean).join(' ');
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightElement, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cls(
              'w-full h-9 rounded-lg border bg-white text-sm text-gray-900',
              'placeholder:text-gray-400',
              'transition-colors outline-none',
              'border-gray-300 hover:border-gray-400',
              'focus:border-gray-900 focus:ring-1 focus:ring-gray-900',
              error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '',
              leftIcon ? 'pl-9 pr-3' : 'px-3',
              rightElement ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-0 bottom-0 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || (label ? `textarea-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cls(
            'w-full rounded-lg border bg-white text-sm text-gray-900',
            'px-3 py-2.5 placeholder:text-gray-400',
            'transition-colors outline-none resize-none',
            'border-gray-300 hover:border-gray-400',
            'focus:border-gray-900 focus:ring-1 focus:ring-gray-900',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
