import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { banMemberSchema } from "@/server/schemas/community.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const bans = await CommunityService.listBans(slug, userId);
        return jsonOk(bans);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = banMemberSchema.parse(body);
        await CommunityService.banMember(slug, userId, input);
        return jsonOk({ success: true }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
