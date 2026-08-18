import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import UserService from "@/server/services/UserService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const score = await UserService.getScore(userId);
        return jsonOk(score);
    } catch (error) {
        return handleApiError(error);
    }
}
