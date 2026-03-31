import { cn } from '@/lib/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
