import { CommunityRole, CommunityVisibility, VoteValue } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import {
    BanMemberInput,
    CreateCommunityInput,
    InviteMemberInput,
    ListCommunitiesQuery,
    UpdateCommunityInput,
    UpdateGuidelinesInput,
} from "../schemas/community.schema";
import {
    CommunityAnalyticsDTO,
    CommunityDetailDTO,
    CommunityGuidelineDTO,
    CommunityMemberDTO,
    CommunitySummaryDTO,
} from "../types/community.types";
import { Paginated } from "../types/common.types";
import { ApiError } from "../utils/response";
import { slugify } from "../utils/slugify";
import { prisma } from "@/infra/db/connect";

type CommunityWithOwnerAndCounts = Prisma.communitiesGetPayload<{
    include: { users: true; _count: { select: { community_members: true; posts: true } } };
}>;

type CommunityWithDetails = Prisma.communitiesGetPayload<{
    include: {
        users: true;
        community_guidelines: true;
        _count: { select: { community_members: true; posts: true } };
    };
}>;

type MemberWithUsers = Prisma.community_membersGetPayload<{
    include: {
        users_community_members_userIdTousers: true;
        users_community_members_invitedByIdTousers: true;
    };
}>;

const MEMBER_INCLUDE = {
    users_community_members_userIdTousers: true,
    users_community_members_invitedByIdTousers: true,
} satisfies Prisma.community_membersInclude;

export class CommunityService {
    private static readonly MANAGER_ROLES: CommunityRole[] = [CommunityRole.OWNER, CommunityRole.MODERATOR];

    static async getCommunitiesByUserId(userId: string): Promise<CommunitySummaryDTO[]> {
        const memberships = await prisma.community_members.findMany({
            where: { userId },
            include: {
                communities: {
                    include: { users: true, _count: { select: { community_members: true, posts: true } } },
                },
            },
            orderBy: { joinedAt: "desc" },
        });

        return memberships.map((m) => CommunityService.buildSummaryDTO(m.communities, m.role));
    }

    static async getCommunities(
        query: ListCommunitiesQuery,
        viewerId?: string | null
    ): Promise<CommunitySummaryDTO[]> {
        const where: Prisma.communitiesWhereInput = query.q
            ? {
                  OR: [
                      { name: { contains: query.q, mode: "insensitive" } },
                      { slug: { contains: query.q, mode: "insensitive" } },
                  ],
              }
            : {};

        const communities = await prisma.communities.findMany({
            where,
            include: { users: true, _count: { select: { community_members: true, posts: true } } },
            orderBy: [{ community_members: { _count: "desc" } }, { createdAt: "desc" }],
            skip: (query.page - 1) * query.pageSize,
            take: query.pageSize,
        });

        const roleMap = viewerId
            ? new Map(
                  (
                      await prisma.community_members.findMany({
                          where: { userId: viewerId, communityId: { in: communities.map((c) => c.id) } },
                      })
                  ).map((m) => [m.communityId, m.role])
              )
            : new Map<string, CommunityRole>();

        return communities.map((c) => CommunityService.buildSummaryDTO(c, roleMap.get(c.id) ?? null));
    }

    static async getCommunityBySlug(slug: string, viewerId?: string | null): Promise<CommunityDetailDTO | null> {
        const community = await prisma.communities.findUnique({
            where: { slug },
            include: {
                users: true,
                community_guidelines: true,
                _count: { select: { community_members: true, posts: true } },
            },
        });
        if (!community) return null;

        if (community.visibility === CommunityVisibility.PRIVATE) {
            const role = viewerId ? await CommunityService.getMemberRole(community.id, viewerId) : null;
            if (!role) return null;
        }

        return CommunityService.buildDetailDTO(community, viewerId);
    }

    static async createCommunity(input: CreateCommunityInput, ownerId: string): Promise<{ id: string; slug: string }> {
        const baseSlug = slugify(input.name);
        if (!baseSlug) throw new ApiError("Name must contain letters or numbers", 422);

        let slug = baseSlug;
        let suffix = 1;
        while (await prisma.communities.findUnique({ where: { slug } })) {
            suffix += 1;
            slug = `${baseSlug}-${suffix}`;
        }

        const community = await prisma.communities.create({
            data: {
                id: crypto.randomUUID(),
                name: input.name,
                slug,
                description: input.description,
                visibility: input.visibility,
                ownerId,
                iconUrl: input.iconUrl ?? `https://api.dicebear.com/9.x/notionists/png?seed=${encodeURIComponent(slug)}`,
                bannerUrl: input.bannerUrl ?? null,
                community_members: { create: { userId: ownerId, role: CommunityRole.OWNER, id: crypto.randomUUID() } },
            },
        });

        return { id: community.id, slug: community.slug };
    }

    static async updateCommunity(
        slug: string,
        input: UpdateCommunityInput,
        actorId: string
    ): Promise<CommunityDetailDTO> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        await CommunityService.requireManagerRole(community.id, actorId);

        await prisma.communities.update({
            where: { id: community.id },
            data: {
                description: input.description,
                visibility: input.visibility,
                iconUrl: input.iconUrl,
                bannerUrl: input.bannerUrl,
            },
        });

        const detail = await CommunityService.getCommunityBySlug(slug, actorId);
        if (!detail) throw new ApiError("Community not found", 404);
        return detail;
    }

    static async joinCommunity(slug: string, userId: string): Promise<CommunityMemberDTO> {
        const community = await CommunityService.findBySlugOrThrow(slug);

        if (await CommunityService.isBanned(community.id, userId)) {
            throw new ApiError("You are banned from this community", 403);
        }
        if (community.visibility === CommunityVisibility.PRIVATE) {
            throw new ApiError("This community is private — you need an invite to join", 403);
        }
        if (await CommunityService.getMemberRole(community.id, userId)) {
            throw new ApiError("You're already a member", 409);
        }

        const member = await prisma.community_members.create({
            data: { id: crypto.randomUUID(), communityId: community.id, userId, role: CommunityRole.MEMBER },
            include: MEMBER_INCLUDE,
        });

        return CommunityService.buildMemberDTO(member);
    }

    static async leaveCommunity(slug: string, userId: string): Promise<void> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        const member = await prisma.community_members.findUnique({
            where: { communityId_userId: { communityId: community.id, userId } },
        });
        if (!member) throw new ApiError("You're not a member of this community", 404);

        if (member.role === CommunityRole.OWNER) {
            await CommunityService.assertNotSoleOwner(community.id, userId);
        }

        await prisma.community_members.delete({ where: { id: member.id } });
    }

    static async listMembers(
        slug: string,
        page: number,
        pageSize: number,
        viewerId?: string | null
    ): Promise<Paginated<CommunityMemberDTO>> {
        const community = await CommunityService.findBySlugOrThrow(slug);

        if (community.visibility === CommunityVisibility.PRIVATE) {
            const role = viewerId ? await CommunityService.getMemberRole(community.id, viewerId) : null;
            if (!role) throw new ApiError("Community not found", 404);
        }

        const [items, total] = await Promise.all([
            prisma.community_members.findMany({
                where: { communityId: community.id },
                include: MEMBER_INCLUDE,
                orderBy: { joinedAt: "asc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.community_members.count({ where: { communityId: community.id } }),
        ]);

        return {
            items: items.map(CommunityService.buildMemberDTO),
            total,
            page,
            pageSize,
            hasMore: page * pageSize < total,
        };
    }

    static async inviteMember(slug: string, actorId: string, input: InviteMemberInput): Promise<CommunityMemberDTO> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        await CommunityService.requireManagerRole(community.id, actorId);

        const targetUser = await prisma.users.findUnique({ where: { id: input.userId } });
        if (!targetUser) throw new ApiError("User not found", 404);

        if (await CommunityService.isBanned(community.id, input.userId)) {
            throw new ApiError("This user is banned from the community", 403);
        }
        if (await CommunityService.getMemberRole(community.id, input.userId)) {
            throw new ApiError("User is already a member", 409);
        }

        const member = await prisma.community_members.create({
            data: {
                id: crypto.randomUUID(),
                communityId: community.id,
                userId: input.userId,
                role: CommunityRole.MEMBER,
                invitedById: actorId,
            },
            include: MEMBER_INCLUDE,
        });

        return CommunityService.buildMemberDTO(member);
    }

    static async updateMemberRole(
        slug: string,
        actorId: string,
        targetUserId: string,
        role: CommunityRole
    ): Promise<CommunityMemberDTO> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        const actorRole = await CommunityService.getMemberRole(community.id, actorId);
        if (actorRole !== CommunityRole.OWNER) {
            throw new ApiError("Only the owner can change member roles", 403);
        }

        const target = await prisma.community_members.findUnique({
            where: { communityId_userId: { communityId: community.id, userId: targetUserId } },
        });
        if (!target) throw new ApiError("Member not found", 404);
        if (target.role === CommunityRole.OWNER) {
            throw new ApiError("Ownership can't be changed here", 400);
        }

        const updated = await prisma.community_members.update({
            where: { id: target.id },
            data: { role },
            include: MEMBER_INCLUDE,
        });

        return CommunityService.buildMemberDTO(updated);
    }

    static async removeMember(slug: string, actorId: string, targetUserId: string): Promise<void> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        const target = await prisma.community_members.findUnique({
            where: { communityId_userId: { communityId: community.id, userId: targetUserId } },
        });
        if (!target) throw new ApiError("Member not found", 404);

        const isSelf = actorId === targetUserId;
        if (isSelf) {
            if (target.role === CommunityRole.OWNER) {
                await CommunityService.assertNotSoleOwner(community.id, targetUserId);
            }
        } else {
            const actorRole = await CommunityService.getMemberRole(community.id, actorId);
            if (!actorRole || !CommunityService.MANAGER_ROLES.includes(actorRole)) {
                throw new ApiError("You don't have permission to remove this member", 403);
            }
            if (target.role === CommunityRole.OWNER) {
                throw new ApiError("Owners can't be removed", 403);
            }
            if (target.role === CommunityRole.MODERATOR && actorRole !== CommunityRole.OWNER) {
                throw new ApiError("Only the owner can remove a moderator", 403);
            }
        }

        await prisma.community_members.delete({ where: { id: target.id } });
    }

    static async getGuidelines(slug: string): Promise<CommunityGuidelineDTO[]> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        const guidelines = await prisma.community_guidelines.findMany({
            where: { communityId: community.id },
            orderBy: { order: "asc" },
        });
        return guidelines.map(CommunityService.toGuidelineDTO);
    }

    static async updateGuidelines(
        slug: string,
        actorId: string,
        input: UpdateGuidelinesInput
    ): Promise<CommunityGuidelineDTO[]> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        await CommunityService.requireManagerRole(community.id, actorId);

        const guidelines = await prisma.$transaction(async (tx) => {
            await tx.community_guidelines.deleteMany({ where: { communityId: community.id } });
            if (input.guidelines.length === 0) return [];
            await tx.community_guidelines.createMany({
                data: input.guidelines.map((g, index) => ({
                    id: crypto.randomUUID(),
                    communityId: community.id,
                    order: index,
                    title: g.title,
                    body: g.body,
                })),
            });
            return tx.community_guidelines.findMany({
                where: { communityId: community.id },
                orderBy: { order: "asc" },
            });
        });

        return guidelines.map(CommunityService.toGuidelineDTO);
    }

    static async listBans(slug: string, actorId: string) {
        const community = await CommunityService.findBySlugOrThrow(slug);
        await CommunityService.requireManagerRole(community.id, actorId);

        const bans = await prisma.community_bans.findMany({
            where: { communityId: community.id },
            include: {
                users_community_bans_userIdTousers: true,
                users_community_bans_bannedByIdTousers: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return bans.map((b) => ({
            userId: b.userId,
            reason: b.reason,
            createdAt: b.createdAt.toISOString(),
            user: CommunityService.toUserSummary(b.users_community_bans_userIdTousers),
            bannedBy: CommunityService.toUserSummary(b.users_community_bans_bannedByIdTousers),
        }));
    }

    static async banMember(slug: string, actorId: string, input: BanMemberInput): Promise<void> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        const actorRole = await CommunityService.requireManagerRole(community.id, actorId);

        if (input.userId === actorId) {
            throw new ApiError("You can't ban yourself", 400);
        }

        const targetUser = await prisma.users.findUnique({ where: { id: input.userId } });
        if (!targetUser) throw new ApiError("User not found", 404);

        const targetMembership = await prisma.community_members.findUnique({
            where: { communityId_userId: { communityId: community.id, userId: input.userId } },
        });
        if (targetMembership?.role === CommunityRole.OWNER) {
            throw new ApiError("Owners can't be banned", 403);
        }
        if (targetMembership?.role === CommunityRole.MODERATOR && actorRole !== CommunityRole.OWNER) {
            throw new ApiError("Only the owner can ban a moderator", 403);
        }

        await prisma.$transaction([
            prisma.community_bans.upsert({
                where: { communityId_userId: { communityId: community.id, userId: input.userId } },
                create: {
                    id: crypto.randomUUID(),
                    communityId: community.id,
                    userId: input.userId,
                    bannedById: actorId,
                    reason: input.reason ?? null,
                },
                update: { reason: input.reason ?? null, bannedById: actorId },
            }),
            ...(targetMembership
                ? [prisma.community_members.delete({ where: { id: targetMembership.id } })]
                : []),
        ]);
    }

    static async unbanMember(slug: string, actorId: string, targetUserId: string): Promise<void> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        await CommunityService.requireManagerRole(community.id, actorId);

        const ban = await prisma.community_bans.findUnique({
            where: { communityId_userId: { communityId: community.id, userId: targetUserId } },
        });
        if (!ban) throw new ApiError("Ban not found", 404);

        await prisma.community_bans.delete({ where: { id: ban.id } });
    }

    static async getAnalytics(slug: string, actorId: string): Promise<CommunityAnalyticsDTO> {
        const community = await CommunityService.findBySlugOrThrow(slug);
        await CommunityService.requireManagerRole(community.id, actorId);

        const [memberCount, postCount, voteAgg, viewAgg, trend] = await Promise.all([
            prisma.community_members.count({ where: { communityId: community.id } }),
            prisma.posts.count({ where: { communityId: community.id } }),
            prisma.votes.groupBy({
                by: ["value"],
                where: { posts: { communityId: community.id } },
                _count: { _all: true },
            }),
            prisma.posts.aggregate({ where: { communityId: community.id }, _sum: { viewCount: true } }),
            prisma.community_analytics_snapshots.findMany({
                where: { communityId: community.id },
                orderBy: { date: "desc" },
                take: 30,
            }),
        ]);

        const totalUpvotes = voteAgg.find((v) => v.value === VoteValue.UP)?._count._all ?? 0;
        const totalDownvotes = voteAgg.find((v) => v.value === VoteValue.DOWN)?._count._all ?? 0;

        return {
            live: {
                memberCount,
                postCount,
                totalUpvotes,
                totalDownvotes,
                totalViews: viewAgg._sum.viewCount ?? 0,
            },
            trend: trend
                .slice()
                .reverse()
                .map((t) => ({
                    date: t.date.toISOString(),
                    memberCount: t.memberCount,
                    postCount: t.postCount,
                    totalUpvotes: t.totalUpvotes,
                    totalDownvotes: t.totalDownvotes,
                    totalViews: t.totalViews,
                })),
        };
    }

    private static async findBySlugOrThrow(slug: string) {
        const community = await prisma.communities.findUnique({ where: { slug } });
        if (!community) throw new ApiError("Community not found", 404);
        return community;
    }

    private static async getMemberRole(communityId: string, userId: string): Promise<CommunityRole | null> {
        const member = await prisma.community_members.findUnique({
            where: { communityId_userId: { communityId, userId } },
        });
        return member?.role ?? null;
    }

    private static async isBanned(communityId: string, userId: string): Promise<boolean> {
        const ban = await prisma.community_bans.findUnique({
            where: { communityId_userId: { communityId, userId } },
        });
        return Boolean(ban);
    }

    private static async requireManagerRole(communityId: string, userId: string): Promise<CommunityRole> {
        const role = await CommunityService.getMemberRole(communityId, userId);
        if (!role || !CommunityService.MANAGER_ROLES.includes(role)) {
            throw new ApiError("You don't have permission to manage this community", 403);
        }
        return role;
    }

    private static async assertNotSoleOwner(communityId: string, userId: string): Promise<void> {
        const otherOwners = await prisma.community_members.count({
            where: { communityId, role: CommunityRole.OWNER, userId: { not: userId } },
        });
        if (otherOwners === 0) {
            throw new ApiError("Transfer ownership before leaving — you're the only owner", 400);
        }
    }

    private static toUserSummary(user: { id: string; username: string; displayName: string; avatarUrl: string | null }) {
        return { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl };
    }

    private static toGuidelineDTO(g: { id: string; order: number; title: string; body: string }): CommunityGuidelineDTO {
        return { id: g.id, order: g.order, title: g.title, body: g.body };
    }

    private static buildSummaryDTO(
        community: CommunityWithOwnerAndCounts,
        viewerRole: CommunityRole | null
    ): CommunitySummaryDTO {
        return {
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            visibility: community.visibility,
            iconUrl: community.iconUrl,
            bannerUrl: community.bannerUrl,
            memberCount: community._count.community_members,
            postCount: community._count.posts,
            owner: CommunityService.toUserSummary(community.users),
            viewerIsMember: Boolean(viewerRole),
            viewerRole,
        };
    }

    private static async buildDetailDTO(
        community: CommunityWithDetails,
        viewerId?: string | null
    ): Promise<CommunityDetailDTO> {
        const [viewerRole, viewerIsBanned] = viewerId
            ? await Promise.all([
                  CommunityService.getMemberRole(community.id, viewerId),
                  CommunityService.isBanned(community.id, viewerId),
              ])
            : [null, false];

        return {
            ...CommunityService.buildSummaryDTO(community, viewerRole),
            guidelines: community.community_guidelines
                .slice()
                .sort((a, b) => a.order - b.order)
                .map(CommunityService.toGuidelineDTO),
            createdAt: community.createdAt.toISOString(),
            viewerIsBanned,
        };
    }

    private static buildMemberDTO(member: MemberWithUsers): CommunityMemberDTO {
        return {
            id: member.id,
            role: member.role,
            joinedAt: member.joinedAt.toISOString(),
            user: CommunityService.toUserSummary(member.users_community_members_userIdTousers),
            invitedBy: member.users_community_members_invitedByIdTousers
                ? CommunityService.toUserSummary(member.users_community_members_invitedByIdTousers)
                : null,
        };
    }
}
