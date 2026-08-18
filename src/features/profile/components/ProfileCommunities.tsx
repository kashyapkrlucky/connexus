"use client";

import Link from "next/link";
import { UsersIcon } from "lucide-react";
import type { UserProfileDTO } from "@/server/types/user.types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { Badge } from "@/shared/components/ui/Badge";

interface ProfileCommunitiesProps {
  communities: UserProfileDTO["communities"];
}

export function ProfileCommunities({ communities }: ProfileCommunitiesProps) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
      <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <UsersIcon className="size-3.5" /> Communities
      </h2>
      {communities.length === 0 ? (
        <p className="text-sm text-gray-500">Not a member of any communities yet.</p>
      ) : (
        <ul className="space-y-0.5">
          {communities.map((c) => (
            <li key={c.id}>
              <Link
                href={`/c/${c.slug}`}
                className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar name={c.name} src={c.iconUrl} size={24} />
                  <span className="truncate">c/{c.slug}</span>
                </span>
                {c.role !== "MEMBER" && (
                  <Badge tone={c.role === "OWNER" ? "brand" : "blue"} className="shrink-0 text-[10px]">
                    {c.role}
                  </Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
