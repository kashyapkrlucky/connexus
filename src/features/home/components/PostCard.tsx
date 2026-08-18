"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2 } from "lucide-react";
import type { PostDTO } from "@/server/types/post.types";
import { Avatar } from "@/shared/components/ui/Avatar";
import { cn } from "@/shared/utils/cn";
import { formatCompactNumber } from "@/shared/utils/format";
import { formatRelativeTime } from "@/shared/utils/date";

interface PostCardProps {
    post: PostDTO;
    onVote: (postId: string, value: "UP" | "DOWN") => void;
}

export function PostCard({ post, onVote }: PostCardProps) {
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
                <Link href={`/p/${post.id}`}>
                    <h3 className="text-base font-semibold text-gray-100 hover:text-gray-300">{post.title}</h3>
                </Link>

                {post.content && (
                    <p className="mt-1.5 line-clamp-4 text-sm text-gray-400">{post.content}</p>
                )}

                {post.imageUrl && (
                    <div className="relative mt-3 h-72 w-full overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
                        <Image src={post.imageUrl} alt={post.title} fill className="object-contain" />
                    </div>
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

                <Link
                    href={`/p/${post.id}`}
                    className="flex items-center gap-1.5 rounded-full border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
                >
                    <MessageSquare className="size-3.5" />
                    {formatCompactNumber(post.commentCount)}
                </Link>

                <button
                    type="button"
                    aria-label="Share"
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-800 bg-gray-800/60 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-700 hover:text-gray-200"
                >
                    <Share2 className="size-3.5" />
                    {formatCompactNumber(post.shareCount)}
                </button>
            </footer>
        </div>
    );
}
