"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "./Avatar";
// import { extractErrorMessage } from "@/shared/utils/apiClient";

interface AvatarUploaderProps {
  name: string;
  value: string | null;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<{ url: string }>;
  size?: number;
  label?: string;
}

export function AvatarUploader({
  name,
  value,
  onChange,
  onUpload,
  size = 64,
  label = "Change photo",
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const { url } = await onUpload(file);
      onChange(url);
    } catch (err) {
      // setError(extractErrorMessage(err, "Couldn't upload photo"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar name={name} src={value} size={size} />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="size-5 animate-spin text-white" />
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-900 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          <Camera className="size-4" /> {label}
        </button>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
