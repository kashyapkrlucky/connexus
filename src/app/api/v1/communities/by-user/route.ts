import { getCurrentUserId } from "@/features/auth/server";
import { CommunityService } from "@/server/services/CommunityService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);

        const communities = await CommunityService.getCommunitiesByUserId(userId);
        return jsonOk({ communities });
    } catch (error) {
        return handleApiError(error);
    }
}
