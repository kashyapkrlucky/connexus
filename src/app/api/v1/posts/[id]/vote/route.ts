import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/features/auth/server";
import { enforceRateLimit } from "@/server/utils/rateLimit";
import { PostService } from "@/server/services/PostService";
import { voteSchema } from "@/server/schemas/post.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);
        await enforceRateLimit("vote", userId);

        const body = await req.json();
        const { value } = voteSchema.parse(body);
        const result = await PostService.votePost(id, userId, value);
        return jsonOk(result);
    } catch (error) {
        return handleApiError(error);
    }
}
