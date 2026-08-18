import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const member = await CommunityService.joinCommunity(slug, userId);
        return jsonOk(member, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
