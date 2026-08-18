import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import UserService from "@/server/services/UserService";
import { updateProfileSchema } from "@/server/schemas/user.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const profile = await UserService.getProfileById(userId);
        if (!profile) throw new ApiError("User not found", 404);

        return jsonOk(profile);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = updateProfileSchema.parse(body);
        const profile = await UserService.updateProfile(userId, input);

        return jsonOk(profile);
    } catch (error) {
        return handleApiError(error);
    }
}
