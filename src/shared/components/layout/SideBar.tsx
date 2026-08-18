"use client";

import { CompassIcon, FlameIcon, HomeIcon, PlusIcon, UsersIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useHomeStore } from "@/features/home/store/useHomeStore";
import { Avatar } from "../ui/Avatar";
import { cn } from "@/shared/utils/cn";

interface SideBarProps {
  children?: ReactNode;
  className?: string;
}

interface NavLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Explore", href: "/explore", icon: CompassIcon },
  { label: "Popular", href: "/popular", icon: FlameIcon },
];

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Help", href: "/help" },
  { label: "Support", href: "/support" },
];

export function SideBar({ children, className }: SideBarProps) {
  const pathname = usePathname();
  const { memberships, getMemberships } = useHomeStore();

  useEffect(() => {
    getMemberships();
  }, [getMemberships]);

  return (
    <aside className={cn("h-full w-72 shrink-0 space-y-3 border-r border-border/40 p-3", className)}>
      <nav className="rounded-2xl border border-gray-700 bg-gray-900 p-2">
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand-500/15 text-brand-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <UsersIcon className="size-3.5" /> My Communities
          </h2>
          <Link
            href="/create-community"
            aria-label="Create community"
            className="flex shrink-0 items-center justify-center rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-brand-400"
          >
            <PlusIcon className="size-4" />
          </Link>
        </div>
        {memberships.length === 0 ? (
          <div className="px-1 py-2 text-center">
            <p className="text-sm text-gray-500">You haven&apos;t joined any communities yet.</p>
            <Link
              href="/explore"
              className="mt-1.5 inline-block text-xs font-medium text-brand-400 hover:text-brand-300"
            >
              Explore communities
            </Link>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {memberships.map((m) => {
              const isActive = pathname === `/c/${m.slug}`;
              return (
                <li key={m.id}>
                  <Link
                    href={`/c/${m.slug}`}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors",
                      isActive ? "bg-gray-800 text-gray-100" : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Avatar name={m.name} src={m.iconUrl} size={22} />
                    <span className="truncate">c/{m.slug}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {children}

      <footer className="px-2 pt-1">
        <nav className="flex flex-wrap gap-x-3 gap-y-1">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-xs text-gray-600 transition-colors hover:text-gray-400">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="mt-2 text-xs text-gray-700">© {new Date().getFullYear()} Connexus</p>
      </footer>
    </aside>
  );
}
