import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'success' | 'warning' | 'error';
  pulse?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'primary', 
  pulse = false,
  children, 
  ...props 
}) => {
  const variants = {
    primary: "bg-ds-primary-500/20 text-ds-primary-300 border-ds-primary-500/30",
    secondary: "bg-ds-surface text-ds-text-secondary border-ds-border",
    accent: "bg-ds-accent/20 text-ds-accent border-ds-accent/30",
    outline: "bg-transparent border-ds-text-tertiary text-ds-text-tertiary",
    success: "bg-ds-success/20 text-ds-success border-ds-success/30",
    warning: "bg-ds-warning/20 text-ds-warning border-ds-warning/30",
    error: "bg-ds-error/20 text-ds-error border-ds-error/30",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-widest backdrop-blur-md",
        variants[variant],
        className
      )} 
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </div>
  );
};

export default Badge;