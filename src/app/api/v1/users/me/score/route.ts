import { getCurrentUserId } from "@/features/auth/server";
import UserService from "@/server/services/UserService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);

        const score = await UserService.getScore(userId);
        return jsonOk(score);
    } catch (error) {
        return handleApiError(error);
    }
}
