import { CompassIcon, FlameIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useHomeStore } from "@/features/home/store/useHomeStore";
import { Avatar } from "../ui/Avatar";

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

  const { memberships, getMemberships } = useHomeStore();

  useEffect(() => {
    getMemberships();
  }, [getMemberships]);


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
      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
        <h2 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <CompassIcon className="size-3.5" /> Your communities
        </h2>
        {memberships.length === 0 ? (
          <p className="px-1 text-sm text-gray-500">You haven&apos;t joined any yet.</p>
        ) : (
          <ul className="space-y-0.5">
            {memberships.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/c/${m.slug}`}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                  <Avatar name={m.name} src={m.iconUrl} size={22} />
                  <span className="truncate">c/{m.slug}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
    </aside>
  );
}
