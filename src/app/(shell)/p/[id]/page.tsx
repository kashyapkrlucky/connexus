"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileXIcon } from "lucide-react";
import useAuthStore from "@/features/auth/store/useAuthStore";
import { usePostStore } from "@/features/post/store/usePostStore";
import { PostCard } from "@/features/home/components/PostCard";
import { CommentSection } from "@/features/post/components/CommentSection";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { post, postLoading, postNotFound, getPost, reset, votePost, deletePost, comments, commentsLoading, getComments } =
    usePostStore();

  useEffect(() => {
    reset();
    getPost(id);
    getComments(id);
  }, [id, getPost, getComments, reset]);

  if (postLoading || (!post && !postNotFound)) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={FileXIcon}
          title="Post not found"
          description="It may have been deleted, or you don't have access to it."
        />
      </div>
    );
  }

  const canDelete = post.author.username === user?.username;

  async function handleDelete() {
    if (!post) return;
    if (!window.confirm("Delete this post? This can't be undone.")) return;
    const ok = await deletePost(post.id);
    if (ok) router.push(`/c/${post.community.slug}`);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <PostCard post={post} onVote={votePost} detailed canDelete={canDelete} onDelete={handleDelete} />
      <CommentSection
        postId={post.id}
        totalCount={post.commentCount}
        comments={comments}
        commentsLoading={commentsLoading}
        currentUsername={user?.username ?? null}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
