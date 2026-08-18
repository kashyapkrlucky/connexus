"use client";

import { MessageSquareIcon } from "lucide-react";
import type { CommentDTO } from "@/server/types/comment.types";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { usePostStore } from "../store/usePostStore";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  postId: string;
  totalCount: number;
  comments: CommentDTO[];
  commentsLoading: boolean;
  currentUsername: string | null;
  isAuthenticated: boolean;
}

export function CommentSection({
  postId,
  totalCount,
  comments,
  commentsLoading,
  currentUsername,
  isAuthenticated,
}: CommentSectionProps) {
  const { addComment, submittingComment } = usePostStore();

  return (
    <div id="comments" className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className="mb-3 text-sm font-semibold text-gray-200">
        {totalCount > 0 ? `${totalCount} comments` : "Comments"}
      </h2>

      {isAuthenticated ? (
        <CommentComposer submitting={submittingComment} onSubmit={(content) => addComment(postId, content)} />
      ) : (
        <p className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5 text-sm text-gray-500">
          Sign in to join the conversation.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-4 border-t border-gray-800 pt-4">
        {commentsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : comments.length === 0 ? (
          <EmptyState icon={MessageSquareIcon} title="No comments yet" description="Be the first to share your thoughts." />
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} currentUsername={currentUsername} />
          ))
        )}
      </div>
    </div>
  );
}
