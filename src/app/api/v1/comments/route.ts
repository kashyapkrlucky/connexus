import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommentService } from "@/server/services/CommentService";
import { createCommentSchema } from "@/server/schemas/comment.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = createCommentSchema.parse(body);
        const comment = await CommentService.createComment(input, userId);
        return jsonOk(comment, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
