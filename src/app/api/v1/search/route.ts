import { NextRequest } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { SearchService } from "@/server/services/SearchService";
import { searchQuerySchema } from "@/server/schemas/search.schema";
import { handleApiError, jsonOk } from "@/server/utils/response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const { q } = searchQuerySchema.parse(Object.fromEntries(searchParams));
        const viewerId = await getUserFromHeaders(req);
        const results = await SearchService.search(q, viewerId);
        return jsonOk(results);
    } catch (error) {
        return handleApiError(error);
    }
}
