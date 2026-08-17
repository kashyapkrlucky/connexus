

interface RightSidePanelProps {
  children?: React.ReactNode;
  className?: string;
}

export function RightSidePanel({ children, className }: RightSidePanelProps) {

  return (
    <aside
      className={`h-full w-72 shrink-0 border-l border-border/40 ${className ?? ""}`}
    >
      {children}
    </aside>
  );
}
