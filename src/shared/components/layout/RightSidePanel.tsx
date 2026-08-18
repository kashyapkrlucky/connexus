import { useHomeStore } from "@/features/home/store/useHomeStore";
import { useEffect } from "react";
import { SparklesIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Avatar } from "../ui/Avatar";


interface RightSidePanelProps {
  children?: React.ReactNode;
  className?: string;
}

export function RightSidePanel({ children, className }: RightSidePanelProps) {

  const { topCommunities, getTopCommunities } = useHomeStore();

  useEffect(() => {
    getTopCommunities();
  }, [getTopCommunities]);

  return (
    <aside
      className={`h-full w-72 shrink-0 border-l border-border/40 ${className ?? ""}`}
    >

      <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
        <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <SparklesIcon className="size-3.5" /> Popular communities
        </h2>
        {topCommunities.length === 0 ? (
          <p className="text-sm text-gray-500">No communities yet.</p>
        ) : (
          <ul className="space-y-0.5">
            {topCommunities.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/c/${c.slug}`}
                  className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={c.name} src={c.iconUrl} size={26} />
                    <span className="truncate">c/{c.slug}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500">
                    <UsersIcon className="size-3" />
                    {/* {formatCompactNumber(c._count.members)} */} 90
                  </span>
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
