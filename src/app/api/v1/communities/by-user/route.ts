import { getCurrentUserId } from "@/features/auth/server";
import { CommunityService } from "@/server/services/CommunityService";
import { handleApiError, jsonOk } from "@/server/utils/response";

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) return jsonOk({ communities: [] });

        const communities = await CommunityService.getCommunitiesByUserId(userId);
        return jsonOk({ communities });
    } catch (error) {
        return handleApiError(error);
    }
}
