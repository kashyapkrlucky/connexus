import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/features/auth/server";
import { CommunityService } from "@/server/services/CommunityService";
import { updateCommunitySchema } from "@/server/schemas/community.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const viewerId = await getCurrentUserId();
        const community = await CommunityService.getCommunityBySlug(slug, viewerId);
        if (!community) throw new ApiError("Community not found", 404);
        return jsonOk(community);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getCurrentUserId();
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = updateCommunitySchema.parse(body);
        const community = await CommunityService.updateCommunity(slug, input, userId);
        return jsonOk(community);
    } catch (error) {
        return handleApiError(error);
    }
}
