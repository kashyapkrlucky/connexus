import { CompassIcon, FlameIcon, HomeIcon, SettingsIcon, UserIcon } from "lucide-react";
import Link from "next/link";

interface SideBarProps {
  children?: React.ReactNode;
  className?: string;
}

export function SideBar({ children, className }: SideBarProps) {
  const links = [
    { label: "Home", href: "/", icon: <HomeIcon className="h-5 w-5 text-gray-400" /> },
    { label: "Explore", href: "/explore", icon: <CompassIcon className="h-5 w-5 text-gray-400" /> },
    { label: "Popular", href: "/popular", icon: <FlameIcon className="h-5 w-5 text-gray-400" /> },
  ];
  return (
    <aside
      className={`h-full w-72 shrink-0 border-r border-border/40 ${className ?? ""}`}
    >
      <div className="flex flex-col gap-2 p-4 border-b border-gray-800">
        {links.map((link: { label: string; href: string; icon: React.ReactNode }) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-muted text-sm text-gray-400 hover:text-white"
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      {children}
    </aside>
  );
}
