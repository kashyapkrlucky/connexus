import internalApi from "@/lib/http/internal";

export type UploadKind = "post" | "community";

export async function uploadImage(file: File, kind: UploadKind): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("kind", kind);

  const { data } = await internalApi.post<{ url: string }>("/v1/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
