import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { inviteMemberSchema } from "@/server/schemas/community.schema";
import { MEMBERS_PAGE_SIZE } from "@/shared/constants";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const viewerId = await getUserFromHeaders(req);
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || MEMBERS_PAGE_SIZE));

        const members = await CommunityService.listMembers(slug, page, pageSize, viewerId);
        return jsonOk(members);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = inviteMemberSchema.parse(body);
        const member = await CommunityService.inviteMember(slug, userId, input);
        return jsonOk(member, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
