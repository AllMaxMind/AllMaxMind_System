import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  className, 
  children, 
  glass = true,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        glass ? "glass-card" : "bg-ds-card border border-ds-border rounded-2xl shadow-xl",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;