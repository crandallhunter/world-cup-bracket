import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'green' | 'subtle';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-surface-3 text-text-secondary border border-border': variant === 'default',
          'bg-gold/10 text-gold border border-gold/20': variant === 'gold',
          'bg-accent/10 text-accent border border-accent/20': variant === 'green',
          'bg-surface-3/50 text-text-muted': variant === 'subtle',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
