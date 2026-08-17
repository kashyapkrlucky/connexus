interface SideBarProps {
  children?: React.ReactNode;
  className?: string;
}

export function SideBar({ children, className }: SideBarProps) {
  return (
    <aside
      className={`h-full w-72 shrink-0 border-r border-border/40 ${className ?? ""}`}
    >
      {children}
    </aside>
  );
}
