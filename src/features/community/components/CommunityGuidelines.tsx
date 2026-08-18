"use client";

import { useState } from "react";
import { BookOpenIcon, PencilIcon } from "lucide-react";
import type { CommunityDetailDTO } from "@/server/types/community.types";
import { GuidelinesEditModal } from "./GuidelinesEditModal";

interface CommunityGuidelinesProps {
  community: CommunityDetailDTO;
  canManage: boolean;
}

export function CommunityGuidelines({ community, canManage }: CommunityGuidelinesProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
          <BookOpenIcon className="size-3.5" /> Guidelines
        </h2>
        {canManage && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit guidelines"
            className="flex shrink-0 items-center justify-center rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-brand-400"
          >
            <PencilIcon className="size-3.5" />
          </button>
        )}
      </div>

      {community.guidelines.length === 0 ? (
        <p className="text-sm text-gray-500">
          {canManage
            ? "Add guidelines to help members know what's expected."
            : "This community hasn't posted guidelines yet."}
        </p>
      ) : (
        <ol className="space-y-3">
          {community.guidelines.map((g, index) => (
            <li key={g.id} className="flex gap-2">
              <span className="shrink-0 text-sm font-semibold text-gray-500">{index + 1}.</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200">{g.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{g.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing && <GuidelinesEditModal onClose={() => setEditing(false)} community={community} />}
    </div>
  );
}
