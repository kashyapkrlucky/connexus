import UserService from "@/server/services/UserService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const profile = await UserService.getProfileByUsername(username);
        if (!profile) throw new ApiError("User not found", 404);

        return jsonOk(profile);
    } catch (error) {
        return handleApiError(error);
    }
}
