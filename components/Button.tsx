import React from 'react';
import { ButtonVariant, ButtonSize } from '../types';
import LoadingSpinner from './ui/LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | 'accent' | 'destructive'; // Extending type for new variants
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '', 
  icon,
  ...props 
}) => {
  
  // Base classes mapping to Design System
  const baseStyles = "relative inline-flex items-center justify-center font-display font-semibold transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ds-bg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-95";
  
  const variants: Record<string, string> = {
    primary: "btn-primary shadow-lg shadow-ds-primary-500/20",
    // Mapping 'glow' to primary with extra pulse for backwards compatibility with Hero
    glow: "btn-primary animate-glow-pulse shadow-lg shadow-ds-primary-500/40",
    secondary: "btn-secondary",
    outline: "bg-transparent border border-ds-primary-500 text-ds-primary-400 hover:bg-ds-primary-900/20",
    ghost: "bg-transparent text-ds-text-tertiary hover:text-ds-text-primary hover:bg-ds-surface",
    accent: "bg-ds-accent text-white hover:bg-ds-accent/90 shadow-lg shadow-ds-accent/20",
    destructive: "bg-ds-error text-white hover:bg-ds-error/90 shadow-lg shadow-ds-error/20"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const currentVariant = variants[variant as string] || variants.primary;

  return (
    <button 
      className={`${baseStyles} ${currentVariant} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size={size === 'sm' ? 'sm' : 'sm'} className="text-current" />
          <span>Loading...</span>
        </span>
      ) : (
        <span className="flex items-center gap-2 z-10">
          {children}
          {icon && <span className="ml-1">{icon}</span>}
        </span>
      )}
      
      {/* Subtle sheen effect for primary buttons */}
      {(variant === 'primary' || variant === 'glow') && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </button>
  );
};

export default Button;