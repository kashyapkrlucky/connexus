import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { NextRequest } from "next/server";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const communities = await CommunityService.getCommunitiesByUserId(userId);
        return jsonOk({ communities });
    } catch (error) {
        return handleApiError(error);
    }
}
