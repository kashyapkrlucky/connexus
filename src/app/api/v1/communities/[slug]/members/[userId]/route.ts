import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { updateMemberRoleSchema } from "@/server/schemas/community.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; userId: string }> }
) {
    try {
        const { slug, userId: targetUserId } = await params;
        const actorId = await getUserFromHeaders(req);
        if (!actorId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const { role } = updateMemberRoleSchema.parse(body);
        const member = await CommunityService.updateMemberRole(slug, actorId, targetUserId, role);
        return jsonOk(member);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string; userId: string }> }
) {
    try {
        const { slug, userId: targetUserId } = await params;
        const actorId = await getUserFromHeaders(req);
        if (!actorId) throw new ApiError("Unauthorized", 401);

        await CommunityService.removeMember(slug, actorId, targetUserId);
        return jsonOk({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
