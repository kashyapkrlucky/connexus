"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import internalApi from "@/lib/http/internal";
import type { PostDTO } from "@/server/types/post.types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { cn } from "@/shared/utils/cn";
import { formatCompactNumber } from "@/shared/utils/format";
import { formatRelativeTime } from "@/shared/utils/date";

interface PostCardProps {
    post: PostDTO;
    onVote: (postId: string, value: "UP" | "DOWN") => void;
    detailed?: boolean;
    canDelete?: boolean;
    onDelete?: () => void;
}

export function PostCard({ post, onVote, detailed = false, canDelete = false, onDelete }: PostCardProps) {
    const [shareCount, setShareCount] = useState(post.shareCount);

    async function handleShare() {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/p/${post.id}`);
            toast.success("Link copied to clipboard");
        } catch {
            // clipboard unavailable — still record the share below
        }
        try {
            const { data } = await internalApi.post<{ shareCount: number }>(`/v1/posts/${post.id}/share`);
            setShareCount(data.shareCount);
        } catch {
            // non-critical, ignore
        }
    }

    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <header className="flex items-center gap-2 text-xs text-gray-400">
                <Link href={`/c/${post.community.slug}`} className="flex items-center gap-1.5 hover:text-gray-200">
                    <Avatar name={post.community.name} src={post.community.iconUrl} size={20} />
                    <span className="font-medium text-gray-300">c/{post.community.slug}</span>
                </Link>
                <span>•</span>
                <Link href={`/u/${post.author.username}`} className="hover:text-gray-200">
                    u/{post.author.username}
                </Link>
                <span>•</span>
                <span>{formatRelativeTime(post.createdAt)}</span>
            </header>

            <section className="mt-2">
                {detailed ? (
                    <h1 className="text-xl font-bold text-gray-100">{post.title}</h1>
                ) : (
                    <Link href={`/p/${post.id}`}>
                        <h3 className="text-base font-semibold text-gray-100 hover:text-gray-300">{post.title}</h3>
                    </Link>
                )}

                {post.content && (
                    <p className={cn("mt-1.5 text-sm text-gray-400", !detailed && "line-clamp-4")}>{post.content}</p>
                )}

                {post.imageUrl && (
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={1200}
                        height={800}
                        sizes="(max-width: 768px) 100vw, 640px"
                        className="mt-3 h-auto w-full rounded-lg border border-gray-800 bg-gray-950"
                    />
                )}
            </section>

            <footer className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-gray-800 bg-gray-800/60 px-1 py-0.5">
                    <button
                        type="button"
                        aria-label="Upvote"
                        onClick={() => onVote(post.id, "UP")}
                        className={cn(
                            "cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-700",
                            post.viewerVote === "UP" ? "text-brand-400" : "text-gray-400"
                        )}
                    >
                        <ArrowBigUp className="size-4" fill={post.viewerVote === "UP" ? "currentColor" : "none"} />
                    </button>
                    <span className="min-w-6 text-center text-sm font-medium text-gray-200">
                        {formatCompactNumber(post.score)}
                    </span>
                    <button
                        type="button"
                        aria-label="Downvote"
                        onClick={() => onVote(post.id, "DOWN")}
                        className={cn(
                            "cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-700",
                            post.viewerVote === "DOWN" ? "text-red-400" : "text-gray-400"
                        )}
                    >
                        <ArrowBigDown className="size-4" fill={post.viewerVote === "DOWN" ? "currentColor" : "none"} />
                    </button>
                </div>

                {detailed ? (
                    <a
                        href="#comments"
                        className="flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
                    >
                        <MessageSquare className="size-3.5" />
                        {formatCompactNumber(post.commentCount)}
                    </a>
                ) : (
                    <Link
                        href={`/p/${post.id}`}
                        className="flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
                    >
                        <MessageSquare className="size-3.5" />
                        {formatCompactNumber(post.commentCount)}
                    </Link>
                )}

                <button
                    type="button"
                    aria-label="Share"
                    onClick={handleShare}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
                >
                    <Share2 className="size-3.5" />
                    {formatCompactNumber(shareCount)}
                </button>

                {canDelete && onDelete && (
                    <button
                        type="button"
                        aria-label="Delete post"
                        onClick={onDelete}
                        className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                    >
                        <Trash2Icon className="size-3.5" />
                    </button>
                )}
            </footer>
        </div>
    );
}
