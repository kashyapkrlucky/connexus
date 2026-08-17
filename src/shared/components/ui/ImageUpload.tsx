"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
// import { extractErrorMessage } from "@/shared/utils/apiClient";
import { cn } from "@/shared/utils/cn";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<{ url: string }>;
  label?: string;
  previewClassName?: string;
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  label = "Add an image",
  previewClassName,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const { url } = await onUpload(file);
      onChange(url);
    } catch (err) {
      // setError(extractErrorMessage(err, "Couldn't upload image"));
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div
        className={cn(
          "relative h-48 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100",
          previewClassName
        )}
      >
        <Image src={value} alt="Upload preview" fill className="object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm hover:bg-black/80"
          aria-label="Remove image"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/50 py-8 text-sm text-neutral-500 transition-colors hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-600 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
        {uploading ? "Uploading..." : label}
      </button>
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
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
