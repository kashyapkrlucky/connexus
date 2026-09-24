import Link from "next/link";
import { ArrowBigUp, MessageSquare } from "lucide-react";
import type { SearchResultsDTO } from "@/server/services/SearchService";
import { Avatar } from "@/shared/components/ui/Avatar";
import { cn } from "@/shared/utils/cn";
import { formatCompactNumber } from "@/shared/utils/format";

interface SearchResultListProps {
  results: SearchResultsDTO;
  compact?: boolean;
  onNavigate?: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      <ul>{children}</ul>
    </section>
  );
}

const rowClass = "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-800";

/** Grouped search results, shared by the top-bar dropdown (`compact`) and the /search page. */
export function SearchResultList({ results, compact = false, onNavigate }: SearchResultListProps) {
  const { communities, users, posts } = results;

  return (
    <div className={cn("flex flex-col", !compact && "gap-2")}>
      {communities.length > 0 && (
        <Section title="Communities">
          {communities.map((c) => (
            <li key={c.id}>
              <Link href={`/c/${c.slug}`} onClick={onNavigate} className={rowClass}>
                <Avatar name={c.name} src={c.iconUrl} size={compact ? 24 : 32} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-100">c/{c.slug}</p>
                  {!compact && <p className="truncate text-xs text-gray-500">{c.description}</p>}
                </div>
                <span className="ml-auto shrink-0 text-xs text-gray-500">
                  {formatCompactNumber(c.memberCount)} members
                </span>
              </Link>
            </li>
          ))}
        </Section>
      )}

      {users.length > 0 && (
        <Section title="People">
          {users.map((u) => (
            <li key={u.id}>
              <Link href={`/u/${u.username}`} onClick={onNavigate} className={rowClass}>
                <Avatar name={u.displayName} src={u.avatarUrl} size={compact ? 24 : 32} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-100">{u.displayName}</p>
                  <p className="truncate text-xs text-gray-500">u/{u.username}</p>
                </div>
              </Link>
            </li>
          ))}
        </Section>
      )}

      {posts.length > 0 && (
        <Section title="Posts">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/p/${p.id}`} onClick={onNavigate} className={cn(rowClass, "items-start")}>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium text-gray-100", compact ? "truncate" : "line-clamp-2")}>
                    {p.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="truncate">c/{p.community.slug}</span>
                    <span className="flex shrink-0 items-center gap-0.5">
                      <ArrowBigUp className="size-3.5" /> {formatCompactNumber(p.score)}
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5">
                      <MessageSquare className="size-3" /> {formatCompactNumber(p.commentCount)}
                    </span>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </Section>
      )}
    </div>
  );
}
