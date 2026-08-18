import { IUser } from "@/features/auth/types";
import { prisma } from "@/infra/db/connect";
import { UpdateProfileInput } from "../schemas/user.schema";
import { UserProfileDTO } from "../types/user.types";
import { UserSummary } from "../types/common.types";
import { ApiError } from "../utils/response";

export class UserService {
    static async create(user: IUser) {
        const existingUser = await prisma.users.findUnique({
            where: {
                id: user.id,
            },
        });
        if (existingUser) {
            return existingUser;
        }
        const userData = await prisma.users.create({
            data: {
                id: user.id,
                displayName: user.name,
                username: user.username,
                avatarUrl: user.avatar,
                bio: "",
            },
        });
        return userData;
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
