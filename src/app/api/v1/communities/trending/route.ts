import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit")) || 5));
        const viewerId = await getUserFromHeaders(req);
        const communities = await CommunityService.getTrendingCommunities(limit, viewerId);
        return jsonOk({ communities });
    } catch (error) {
        return handleApiError(error);
    }
}
