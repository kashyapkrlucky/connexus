interface ModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border border-border/40 bg-surface p-6 text-foreground shadow-lg shadow-accent/10 ${className ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}
