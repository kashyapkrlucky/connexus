import { PostService } from "@/server/services/PostService";
import { handleApiError, jsonOk } from "@/server/utils/response";
import { getViewerKey } from "@/server/utils/viewerKey";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await PostService.incrementView(id, await getViewerKey(req));
        return jsonOk(result);
    } catch (error) {
        return handleApiError(error);
    }
}
