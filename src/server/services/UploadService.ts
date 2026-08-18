import { randomUUID } from "crypto";

import {
    COMMUNITY_IMAGES_BUCKET,
    isSupabaseConfigured,
    POST_IMAGES_BUCKET,
    supabaseServerClient,
} from "@/infra/supabase/serverClient";
import { ApiError } from "../utils/response";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

async function uploadImage(file: File, bucket: string): Promise<{ url: string }> {
    if (!isSupabaseConfigured || !supabaseServerClient) {
        throw new ApiError(
            "Image uploads aren't configured yet — add Supabase env vars to enable them",
            503
        );
    }

    console.log("allowed types", ALLOWED_TYPES);
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new ApiError("Unsupported image type", 422);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new ApiError("Image must be under 5MB", 422);
    }

    const ext = file.type.split("/")[1] ?? "jpg";
    const path = `${new Date().getTime()}.${ext}`;
    console.log("uploading image", ext, path);
    const { error } = await supabaseServerClient.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: false });

    if (error) throw new ApiError(`Upload failed: ${error.message}`, 500);

    const { data } = supabaseServerClient.storage.from(bucket).getPublicUrl(path);
    console.log("uploaded image", data.publicUrl);
    return { url: data.publicUrl };
}

export function uploadPostImage(file: File) {
    return uploadImage(file, POST_IMAGES_BUCKET);
}

export function uploadCommunityImage(file: File) {
    return uploadImage(file, COMMUNITY_IMAGES_BUCKET);
}
