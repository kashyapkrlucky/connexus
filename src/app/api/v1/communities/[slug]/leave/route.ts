import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/features/auth/server";
import { CommunityService } from "@/server/services/CommunityService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);

        await CommunityService.leaveCommunity(slug, userId);
        return jsonOk({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
