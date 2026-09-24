import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/features/auth/server";
import { CommunityService } from "@/server/services/CommunityService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);

        const member = await CommunityService.joinCommunity(slug, userId);
        return jsonOk(member, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
