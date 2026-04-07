'use client';

import type { Division } from '@/lib/divisions';
import { cn } from '@/lib/utils/cn';

interface DivisionBadgeProps {
  division: Division;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

export function DivisionBadge({ division, size = 'sm', showLabel = true, className }: DivisionBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        `bg-gradient-to-r ${division.bgGradient}`,
        'border border-white/10',
        sizeClasses[size],
        className
      )}
    >
      <span>{division.icon}</span>
      {showLabel && (
        <span className={`bg-gradient-to-r ${division.color} bg-clip-text text-transparent`}>
          {division.name}
        </span>
      )}
    </span>
  );
}
