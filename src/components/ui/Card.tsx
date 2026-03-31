import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-surface-2 border border-border rounded-xl', className)}>
      {children}
    </div>
  );
}
