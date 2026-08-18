import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { CommunityService } from "@/server/services/CommunityService";
import { updateGuidelinesSchema } from "@/server/schemas/community.schema";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const guidelines = await CommunityService.getGuidelines(slug);
        return jsonOk(guidelines);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const userId = await getUserFromHeaders(req);
        if (!userId) throw new ApiError("Unauthorized", 401);

        const body = await req.json();
        const input = updateGuidelinesSchema.parse(body);
        const guidelines = await CommunityService.updateGuidelines(slug, userId, input);
        return jsonOk(guidelines);
    } catch (error) {
        return handleApiError(error);
    }
}
