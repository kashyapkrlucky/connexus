import { randomUUID } from "crypto";
import { prisma } from "@/infra/db/connect";
import { UpdateProfileInput } from "../schemas/user.schema";
import { UserProfileDTO, UserScoreDTO } from "../types/user.types";
import { UserSummary } from "../types/common.types";
import { ApiError } from "../utils/response";
import { getRankForXp, XP_WEIGHTS } from "../utils/rank";

export class UserService {
    /** Returns the user linked to this Google email, creating one on first sign-in. */
    static async findOrCreateFromGoogle(profile: { email: string; name: string; image: string | null }) {
        const existing = await prisma.users.findUnique({ where: { email: profile.email } });
        if (existing) return existing;

        return prisma.users.create({
            data: {
                id: randomUUID(),
                email: profile.email,
                username: await UserService.generateUsername(profile.email),
                displayName: profile.name,
                avatarUrl: profile.image,
                bio: "",
            },
        });
    }

    private static async generateUsername(email: string) {
        const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20) || "user";
        let candidate = base;
        while (await prisma.users.findUnique({ where: { username: candidate } })) {
            candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
        }
        return candidate;
    }

    static async getUserById(id: string) {
        const user = await prisma.users.findUnique({
            where: {
                id,
            },
        });
        return user;
    }

    static async getProfileById(id: string): Promise<UserProfileDTO | null> {
        const user = await prisma.users.findUnique({ where: { id } });
        if (!user) return null;
        return UserService.buildProfileDTO(user);
    }

    static async getProfileByUsername(username: string): Promise<UserProfileDTO | null> {
        const user = await prisma.users.findUnique({ where: { username } });
        if (!user) return null;
        return UserService.buildProfileDTO(user);
    }

    static async searchUsers(q: string, limit = 5): Promise<UserSummary[]> {
        const users = await prisma.users.findMany({
            where: {
                OR: [
                    { username: { contains: q, mode: "insensitive" } },
                    { displayName: { contains: q, mode: "insensitive" } },
                ],
            },
            take: limit,
        });

        return users.map((u) => ({
            id: u.id,
            username: u.username,
            displayName: u.displayName,
            avatarUrl: u.avatarUrl,
        }));
    }

    static async getScore(userId: string): Promise<UserScoreDTO> {
        const [postCount, commentCount, communityCount, postVoteCount, commentVoteCount] = await Promise.all([
            prisma.posts.count({ where: { authorId: userId } }),
            prisma.comments.count({ where: { authorId: userId } }),
            prisma.communities.count({ where: { ownerId: userId } }),
            prisma.votes.count({ where: { userId } }),
            prisma.comment_votes.count({ where: { userId } }),
        ]);

        const voteCount = postVoteCount + commentVoteCount;
        const xp =
            postCount * XP_WEIGHTS.post +
            commentCount * XP_WEIGHTS.comment +
            communityCount * XP_WEIGHTS.communityCreated +
            voteCount * XP_WEIGHTS.vote;

        return {
            xp,
            breakdown: { postCount, commentCount, communityCount, voteCount },
            rank: getRankForXp(xp),
        };
    }

    static async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfileDTO> {
        const existing = await prisma.users.findUnique({ where: { id: userId } });
        if (!existing) throw new ApiError("User not found", 404);

        const user = await prisma.users.update({
            where: { id: userId },
            data: {
                displayName: input.displayName,
                bio: input.bio ?? null,
                avatarUrl: input.avatarUrl ?? null,
            },
        });
        return UserService.buildProfileDTO(user);
    }

    private static async buildProfileDTO(user: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
        bio: string | null;
        isBot: boolean;
        createdAt: Date;
    }): Promise<UserProfileDTO> {
        const [postCount, postScore, commentScore, memberships] = await Promise.all([
            prisma.posts.count({ where: { authorId: user.id } }),
            prisma.posts.aggregate({ where: { authorId: user.id }, _sum: { score: true } }),
            prisma.comments.aggregate({ where: { authorId: user.id }, _sum: { score: true } }),
            prisma.community_members.findMany({
                where: { userId: user.id },
                include: { communities: true },
            }),
        ]);

        const karma = (postScore._sum.score ?? 0) + (commentScore._sum.score ?? 0);

        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            isBot: user.isBot,
            bio: user.bio,
            createdAt: user.createdAt.toISOString(),
            stats: {
                postCount,
                karma,
                communityCount: memberships.length,
            },
            communities: memberships.map((m) => ({
                id: m.communities.id,
                slug: m.communities.slug,
                name: m.communities.name,
                iconUrl: m.communities.iconUrl,
                role: m.role,
            })),
        };
    }
}

export default UserService;
