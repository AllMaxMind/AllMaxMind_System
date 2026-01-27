import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-ds-text-secondary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "input-field",
            error && "border-ds-error focus:ring-ds-error/50 focus:border-ds-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-ds-error mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;