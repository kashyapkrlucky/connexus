import { CommunityVisibility, VoteValue } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import { CreateCommentInput, VoteCommentInput } from "../schemas/comment.schema";
import { CommentDTO } from "../types/comment.types";
import { ApiError } from "../utils/response";
import { prisma } from "@/infra/db/connect";

type CommentWithAuthor = Prisma.commentsGetPayload<{ include: { users: true } }>;

export class CommentService {
    static async getCommentsForPost(postId: string, viewerId?: string | null): Promise<CommentDTO[]> {
        const post = await prisma.posts.findUnique({ where: { id: postId }, include: { communities: true } });
        if (!post) throw new ApiError("Post not found", 404);

        if (post.communities.visibility === CommunityVisibility.PRIVATE) {
            const isMember = viewerId
                ? await prisma.community_members.findUnique({
                      where: { communityId_userId: { communityId: post.communities.id, userId: viewerId } },
                  })
                : null;
            if (!isMember) throw new ApiError("Post not found", 404);
        }

        const comments = await prisma.comments.findMany({
            where: { postId },
            include: { users: true },
            orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        });

        const viewerVotes = viewerId
            ? await prisma.comment_votes.findMany({
                  where: { userId: viewerId, commentId: { in: comments.map((c) => c.id) } },
              })
            : [];
        const viewerVoteMap = new Map(viewerVotes.map((v) => [v.commentId, v.value]));

        return CommentService.buildTree(comments, null, viewerVoteMap);
    }

    static async createComment(input: CreateCommentInput, authorId: string): Promise<CommentDTO> {
        const post = await prisma.posts.findUnique({ where: { id: input.postId }, include: { communities: true } });
        if (!post) throw new ApiError("Post not found", 404);

        const [membership, banned] = await Promise.all([
            prisma.community_members.findUnique({
                where: { communityId_userId: { communityId: post.communityId, userId: authorId } },
            }),
            prisma.community_bans.findUnique({
                where: { communityId_userId: { communityId: post.communityId, userId: authorId } },
            }),
        ]);
        if (banned) throw new ApiError("You are banned from this community", 403);
        if (post.communities.visibility === CommunityVisibility.PRIVATE && !membership) {
            throw new ApiError("You must be a member to comment in this community", 403);
        }

        if (input.parentId) {
            const parent = await prisma.comments.findUnique({ where: { id: input.parentId } });
            if (!parent || parent.postId !== input.postId) {
                throw new ApiError("Parent comment not found on this post", 404);
            }
        }

        const comment = await prisma.comments.create({
            data: {
                id: crypto.randomUUID(),
                content: input.content,
                postId: input.postId,
                authorId,
                parentId: input.parentId ?? null,
            },
            include: { users: true },
        });

        return CommentService.buildCommentDTO(comment, null, []);
    }

    static async deleteComment(id: string, actorId: string): Promise<void> {
        const comment = await prisma.comments.findUnique({ where: { id }, include: { posts: true } });
        if (!comment) throw new ApiError("Comment not found", 404);

        if (comment.authorId !== actorId) {
            const membership = await prisma.community_members.findUnique({
                where: { communityId_userId: { communityId: comment.posts.communityId, userId: actorId } },
            });
            if (!membership || (membership.role !== "OWNER" && membership.role !== "MODERATOR")) {
                throw new ApiError("You don't have permission to delete this comment", 403);
            }
        }

        await prisma.comments.delete({ where: { id } });
    }

    static async voteComment(
        commentId: string,
        userId: string,
        value: VoteCommentInput["value"]
    ): Promise<{ score: number; viewerVote: VoteValue | null }> {
        const comment = await prisma.comments.findUnique({ where: { id: commentId } });
        if (!comment) throw new ApiError("Comment not found", 404);

        if (value === "NONE") {
            await prisma.comment_votes.deleteMany({ where: { commentId, userId } });
        } else {
            await prisma.comment_votes.upsert({
                where: { commentId_userId: { commentId, userId } },
                create: { id: crypto.randomUUID(), commentId, userId, value },
                update: { value },
            });
        }

        const [upCount, downCount] = await Promise.all([
            prisma.comment_votes.count({ where: { commentId, value: VoteValue.UP } }),
            prisma.comment_votes.count({ where: { commentId, value: VoteValue.DOWN } }),
        ]);
        const score = upCount - downCount;

        await prisma.comments.update({ where: { id: commentId }, data: { score } });

        return { score, viewerVote: value === "NONE" ? null : value };
    }

    private static buildTree(
        comments: CommentWithAuthor[],
        parentId: string | null,
        viewerVoteMap: Map<string, VoteValue>
    ): CommentDTO[] {
        return comments
            .filter((c) => c.parentId === parentId)
            .map((c) =>
                CommentService.buildCommentDTO(
                    c,
                    viewerVoteMap.get(c.id) ?? null,
                    CommentService.buildTree(comments, c.id, viewerVoteMap)
                )
            );
    }

    private static buildCommentDTO(
        comment: CommentWithAuthor,
        viewerVote: VoteValue | null,
        replies: CommentDTO[]
    ): CommentDTO {
        return {
            id: comment.id,
            content: comment.content,
            postId: comment.postId,
            parentId: comment.parentId,
            score: comment.score,
            createdAt: comment.createdAt.toISOString(),
            author: {
                id: comment.users.id,
                username: comment.users.username,
                displayName: comment.users.displayName,
                avatarUrl: comment.users.avatarUrl,
            },
            viewerVote,
            replies,
        };
    }
}
