import { PostService } from "@/server/services/PostService";
import { handleApiError, jsonOk } from "@/server/utils/response";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await PostService.incrementView(id);
        return jsonOk(result);
    } catch (error) {
        return handleApiError(error);
    }
}
