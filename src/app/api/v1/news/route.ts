import { NextRequest } from "next/server";
import { NewsService } from "@/server/services/NewsService";
import { handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(30, Math.max(1, Number(searchParams.get("limit")) || 5));
        const items = await NewsService.getTopHeadlines(limit);
        return jsonOk({ items });
    } catch (error) {
        return handleApiError(error);
    }
}
