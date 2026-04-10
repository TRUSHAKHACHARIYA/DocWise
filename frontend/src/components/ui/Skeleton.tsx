import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export default function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200",
        variant === 'circle' && "rounded-full",
        variant === 'rect' && "rounded-2xl",
        variant === 'text' && "rounded h-4 w-full",
        className
      )}
      {...props}
    />
  );
}
