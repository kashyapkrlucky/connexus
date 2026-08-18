import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const { searchParams } = new URL(req.url);
        const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 5));
        const communities = await CommunityService.getCommunitiesToExplore(userId, limit);
        return jsonOk({ communities });
    } catch (error) {
        return handleApiError(error);
    }
}
