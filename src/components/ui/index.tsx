import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={cn(
        "rounded-3xl p-6 shadow-xl relative overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const variants = {
    primary: "bg-party-yellow text-party-black font-bold",
    secondary: "bg-white/10 text-white font-bold backdrop-blur-sm",
    outline: "border-2 border-party-yellow text-party-yellow font-bold bg-transparent",
    ghost: "bg-transparent text-white/60 font-bold",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-xl",
  };

  return (
    <button 
      className={cn(
        "rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
