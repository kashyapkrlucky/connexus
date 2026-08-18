import { getUserFromHeaders } from "@/features/auth/utils";
import { NextRequest } from "next/server";
import { CommunityService } from "@/server/services/CommunityService";
import { createCommunitySchema, listCommunitiesQuerySchema } from "@/server/schemas/community.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = listCommunitiesQuerySchema.parse(Object.fromEntries(searchParams));
        const viewerId = await getUserFromHeaders(req);
        const communities = await CommunityService.getCommunities(query, viewerId);
        return jsonOk({ communities });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = createCommunitySchema.parse(body);
        const community = await CommunityService.createCommunity(input, userId);
        return jsonOk({ communityId: community.id, slug: community.slug }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
