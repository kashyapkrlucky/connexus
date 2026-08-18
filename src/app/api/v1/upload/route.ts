import { uploadCommunityImage, uploadPostImage } from "@/server/services/UploadService";
import { ApiError, handleApiError, jsonOk } from "@/server/utils/response";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("Missing file", 422);
    }
    const kind = formData.get("kind");
    const result = kind === "community" ? await uploadCommunityImage(file) : await uploadPostImage(file);
    return jsonOk(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
