'use client';

import { cn } from '@/lib/utils/cn';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed',
        {
          'bg-white hover:bg-white/85 text-black': variant === 'primary',
          'bg-white/6 hover:bg-white/10 text-white/70 hover:text-white border border-white/10': variant === 'secondary',
          'hover:bg-white/6 text-white/40 hover:text-white/70': variant === 'ghost',
          'bg-red-600 hover:bg-red-700 text-white': variant === 'danger',
          'text-xs px-3 py-1.5 gap-1.5': size === 'sm',
          'text-sm px-4 py-2 gap-2': size === 'md',
          'text-sm px-6 py-3 gap-2': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
