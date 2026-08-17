interface LoadingProps {
  className?: string;
}

export function Loading({ className }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center p-4 ${className ?? ""}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border/40 border-t-accent" />
    </div>
  );
}
