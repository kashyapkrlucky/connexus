import { CommunityVisibility, PostType, VoteValue } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import { CreatePostInput, ListPostsQuery, VoteInput } from "../schemas/post.schema";
import { PostDTO } from "../types/post.types";
import { Paginated } from "../types/common.types";
import { ApiError } from "../utils/response";
import { computeHotScore } from "../utils/hotScore";
import { prisma } from "@/infra/db/connect";

type PostWithRelations = Prisma.postsGetPayload<{
    include: { users: true; communities: true; _count: { select: { comments: true } } };
}>;

const POST_INCLUDE = {
    users: true,
    communities: true,
    _count: { select: { comments: true } },
} satisfies Prisma.postsInclude;

export class PostService {
    static async listPosts(query: ListPostsQuery, viewerId?: string | null): Promise<Paginated<PostDTO>> {
        const where = await PostService.buildScopeWhere(query, viewerId);
        if (!where) {
            return { items: [], total: 0, page: query.page, pageSize: query.pageSize, hasMore: false };
        }

        const orderBy: Prisma.postsOrderByWithRelationInput =
            query.sort === "top"
                ? { score: "desc" }
                : query.sort === "views"
                  ? { viewCount: "desc" }
                  : query.sort === "hot"
                    ? { hotScore: "desc" }
                    : { createdAt: "desc" };

        const [posts, total] = await Promise.all([
            prisma.posts.findMany({
                where,
                include: POST_INCLUDE,
                orderBy,
                skip: (query.page - 1) * query.pageSize,
                take: query.pageSize,
            }),
            prisma.posts.count({ where }),
        ]);

        const items = await PostService.attachVotes(posts, viewerId);

        return {
            items,
            total,
            page: query.page,
            pageSize: query.pageSize,
            hasMore: query.page * query.pageSize < total,
        };
    }

    static async getPostById(id: string, viewerId?: string | null): Promise<PostDTO | null> {
        const post = await prisma.posts.findUnique({ where: { id }, include: POST_INCLUDE });
        if (!post) return null;

        if (post.communities.visibility === CommunityVisibility.PRIVATE) {
            const isMember = viewerId
                ? await prisma.community_members.findUnique({
                      where: { communityId_userId: { communityId: post.communities.id, userId: viewerId } },
                  })
                : null;
            if (!isMember) return null;
        }

        const [dto] = await PostService.attachVotes([post], viewerId);
        return dto;
    }

    static async createPost(input: CreatePostInput, authorId: string): Promise<PostDTO> {
        const community = await prisma.communities.findUnique({ where: { id: input.communityId } });
        if (!community) throw new ApiError("Community not found", 404);

        const [membership, banned] = await Promise.all([
            prisma.community_members.findUnique({
                where: { communityId_userId: { communityId: community.id, userId: authorId } },
            }),
            prisma.community_bans.findUnique({
                where: { communityId_userId: { communityId: community.id, userId: authorId } },
            }),
        ]);
        if (banned) throw new ApiError("You are banned from this community", 403);
        if (community.visibility === CommunityVisibility.PRIVATE && !membership) {
            throw new ApiError("You must be a member to post in this community", 403);
        }

        const post = await prisma.posts.create({
            data: {
                id: crypto.randomUUID(),
                title: input.title,
                content: input.content ?? null,
                imageUrl: input.imageUrl ?? null,
                type: input.imageUrl ? PostType.IMAGE : PostType.TEXT,
                communityId: community.id,
                authorId,
                hotScore: computeHotScore(0, new Date()),
            },
            include: POST_INCLUDE,
        });

        const [dto] = await PostService.attachVotes([post], authorId);
        return dto;
    }

    static async searchPosts(q: string, viewerId?: string | null, limit = 5): Promise<PostDTO[]> {
        const where: Prisma.postsWhereInput = {
            AND: [
                { OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] },
                PostService.visibilityFilter(viewerId),
            ],
        };

        const posts = await prisma.posts.findMany({
            where,
            include: POST_INCLUDE,
            orderBy: { score: "desc" },
            take: limit,
        });

        return PostService.attachVotes(posts, viewerId);
    }

    static async deletePost(id: string, actorId: string): Promise<void> {
        const post = await prisma.posts.findUnique({ where: { id } });
        if (!post) throw new ApiError("Post not found", 404);

        if (post.authorId !== actorId) {
            const membership = await prisma.community_members.findUnique({
                where: { communityId_userId: { communityId: post.communityId, userId: actorId } },
            });
            if (!membership || (membership.role !== "OWNER" && membership.role !== "MODERATOR")) {
                throw new ApiError("You don't have permission to delete this post", 403);
            }
        }

        await prisma.posts.delete({ where: { id } });
    }

    static async votePost(
        postId: string,
        userId: string,
        value: VoteInput["value"]
    ): Promise<{ score: number; viewerVote: VoteValue | null }> {
        const post = await prisma.posts.findUnique({ where: { id: postId } });
        if (!post) throw new ApiError("Post not found", 404);

        if (value === "NONE") {
            await prisma.votes.deleteMany({ where: { postId, userId } });
        } else {
            await prisma.votes.upsert({
                where: { postId_userId: { postId, userId } },
                create: { id: crypto.randomUUID(), postId, userId, value },
                update: { value },
            });
        }

        const [upCount, downCount] = await Promise.all([
            prisma.votes.count({ where: { postId, value: VoteValue.UP } }),
            prisma.votes.count({ where: { postId, value: VoteValue.DOWN } }),
        ]);
        const score = upCount - downCount;
        const hotScore = computeHotScore(score, post.createdAt);

        await prisma.posts.update({ where: { id: postId }, data: { score, hotScore } });

        return { score, viewerVote: value === "NONE" ? null : value };
    }

    static async incrementView(postId: string): Promise<{ viewCount: number }> {
        const exists = await prisma.posts.findUnique({ where: { id: postId }, select: { id: true } });
        if (!exists) throw new ApiError("Post not found", 404);

        const post = await prisma.posts.update({
            where: { id: postId },
            data: { viewCount: { increment: 1 } },
            select: { viewCount: true },
        });
        return { viewCount: post.viewCount };
    }

    static async incrementShare(postId: string): Promise<{ shareCount: number }> {
        const exists = await prisma.posts.findUnique({ where: { id: postId }, select: { id: true } });
        if (!exists) throw new ApiError("Post not found", 404);

        const post = await prisma.posts.update({
            where: { id: postId },
            data: { shareCount: { increment: 1 } },
            select: { shareCount: true },
        });
        return { shareCount: post.shareCount };
    }

    private static async buildScopeWhere(
        query: ListPostsQuery,
        viewerId?: string | null
    ): Promise<Prisma.postsWhereInput | null> {
        if (query.scope === "community") {
            if (!query.communitySlug) throw new ApiError("communitySlug is required for community scope", 422);

            const community = await prisma.communities.findUnique({ where: { slug: query.communitySlug } });
            if (!community) throw new ApiError("Community not found", 404);

            if (community.visibility === CommunityVisibility.PRIVATE) {
                const isMember = viewerId
                    ? await prisma.community_members.findUnique({
                          where: { communityId_userId: { communityId: community.id, userId: viewerId } },
                      })
                    : null;
                if (!isMember) throw new ApiError("Community not found", 404);
            }

            return { communityId: community.id };
        }

        if (query.scope === "user") {
            if (!query.username) throw new ApiError("username is required for user scope", 422);

            const author = await prisma.users.findUnique({ where: { username: query.username } });
            if (!author) throw new ApiError("User not found", 404);

            return { authorId: author.id, ...PostService.visibilityFilter(viewerId) };
        }

        if (query.scope === "popular") {
            return PostService.visibilityFilter(viewerId);
        }

        // scope === "home"
        if (!viewerId) {
            return PostService.visibilityFilter(viewerId);
        }
        const memberships = await prisma.community_members.findMany({
            where: { userId: viewerId },
            select: { communityId: true },
        });
        if (memberships.length === 0) return null;
        return { communityId: { in: memberships.map((m) => m.communityId) } };
    }

    private static visibilityFilter(viewerId?: string | null): Prisma.postsWhereInput {
        const communityOr: Prisma.communitiesWhereInput[] = [{ visibility: CommunityVisibility.PUBLIC }];
        if (viewerId) {
            communityOr.push({ community_members: { some: { userId: viewerId } } });
        }
        return { communities: { OR: communityOr } };
    }

    private static async attachVotes(posts: PostWithRelations[], viewerId?: string | null): Promise<PostDTO[]> {
        if (posts.length === 0) return [];
        const postIds = posts.map((p) => p.id);

        const [voteAgg, viewerVotes] = await Promise.all([
            prisma.votes.groupBy({
                by: ["postId", "value"],
                where: { postId: { in: postIds } },
                _count: { _all: true },
            }),
            viewerId
                ? prisma.votes.findMany({ where: { postId: { in: postIds }, userId: viewerId } })
                : Promise.resolve([]),
        ]);

        const voteMap = new Map<string, { up: number; down: number }>();
        for (const row of voteAgg) {
            const entry = voteMap.get(row.postId) ?? { up: 0, down: 0 };
            if (row.value === VoteValue.UP) entry.up = row._count._all;
            else entry.down = row._count._all;
            voteMap.set(row.postId, entry);
        }

        const viewerVoteMap = new Map(viewerVotes.map((v) => [v.postId, v.value]));

        return posts.map((post) =>
            PostService.buildPostDTO(post, voteMap.get(post.id) ?? { up: 0, down: 0 }, viewerVoteMap.get(post.id) ?? null)
        );
    }

    private static buildPostDTO(
        post: PostWithRelations,
        votes: { up: number; down: number },
        viewerVote: VoteValue | null
    ): PostDTO {
        return {
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            type: post.type,
            score: post.score,
            upvotes: votes.up,
            downvotes: votes.down,
            viewCount: post.viewCount,
            shareCount: post.shareCount,
            commentCount: post._count.comments,
            hotScore: post.hotScore,
            createdAt: post.createdAt.toISOString(),
            author: {
                id: post.users.id,
                username: post.users.username,
                displayName: post.users.displayName,
                avatarUrl: post.users.avatarUrl,
            },
            community: {
                id: post.communities.id,
                slug: post.communities.slug,
                name: post.communities.name,
                visibility: post.communities.visibility,
                iconUrl: post.communities.iconUrl,
            },
            viewerVote,
        };
    }
}
