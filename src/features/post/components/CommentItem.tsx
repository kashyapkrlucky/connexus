"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowBigDown, ArrowBigUp, MessageSquareIcon, Trash2Icon } from "lucide-react";
import type { CommentDTO } from "@/server/types/comment.types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { cn } from "@/shared/utils/cn";
import { formatCompactNumber } from "@/shared/utils/format";
import { formatRelativeTime } from "@/shared/utils/date";
import { usePostStore } from "../store/usePostStore";
import { CommentComposer } from "./CommentComposer";

interface CommentItemProps {
  comment: CommentDTO;
  postId: string;
  currentUsername: string | null;
  depth?: number;
}

export function CommentItem({ comment, postId, currentUsername, depth = 0 }: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const { voteComment, addComment, deleteComment, submittingComment } = usePostStore();

  const canDelete = currentUsername !== null && currentUsername === comment.author.username;

  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-gray-800 pl-3 sm:ml-6 sm:pl-4")}>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link href={`/u/${comment.author.username}`} className="flex items-center gap-1.5 hover:text-gray-200">
          <Avatar name={comment.author.displayName} src={comment.author.avatarUrl} size={18} />
          <span className="font-medium text-gray-300">u/{comment.author.username}</span>
        </Link>
        <span>•</span>
        <span>{formatRelativeTime(comment.createdAt)}</span>
      </div>

      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{comment.content}</p>

      <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-0.5 rounded-full border border-gray-800 bg-gray-800/60 px-1 py-0.5">
          <button
            type="button"
            aria-label="Upvote"
            onClick={() => voteComment(comment.id, "UP")}
            className={cn(
              "cursor-pointer rounded-full p-0.5 transition-colors hover:bg-gray-700",
              comment.viewerVote === "UP" ? "text-brand-400" : "text-gray-400"
            )}
          >
            <ArrowBigUp className="size-3.5" fill={comment.viewerVote === "UP" ? "currentColor" : "none"} />
          </button>
          <span className="min-w-4 text-center font-medium text-gray-300">{formatCompactNumber(comment.score)}</span>
          <button
            type="button"
            aria-label="Downvote"
            onClick={() => voteComment(comment.id, "DOWN")}
            className={cn(
              "cursor-pointer rounded-full p-0.5 transition-colors hover:bg-gray-700",
              comment.viewerVote === "DOWN" ? "text-red-400" : "text-gray-400"
            )}
          >
            <ArrowBigDown className="size-3.5" fill={comment.viewerVote === "DOWN" ? "currentColor" : "none"} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setReplying((v) => !v)}
          className="flex cursor-pointer items-center gap-1 hover:text-gray-300"
        >
          <MessageSquareIcon className="size-3.5" /> Reply
        </button>

        {canDelete && (
          <button
            type="button"
            onClick={() => deleteComment(comment.id, postId)}
            className="flex cursor-pointer items-center gap-1 hover:text-red-400"
          >
            <Trash2Icon className="size-3.5" /> Delete
          </button>
        )}
      </div>

      {replying && (
        <div className="mt-2">
          <CommentComposer
            placeholder={`Reply to u/${comment.author.username}...`}
            autoFocus
            submitting={submittingComment}
            onCancel={() => setReplying(false)}
            onSubmit={async (content) => {
              const ok = await addComment(postId, content, comment.id);
              if (ok) setReplying(false);
              return ok;
            }}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-3 flex flex-col gap-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} currentUsername={currentUsername} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
