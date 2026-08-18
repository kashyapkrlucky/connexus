"use client";

import { useState } from "react";
import { GlobeIcon, LockIcon } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { Textarea } from "@/shared/components/ui/Textarea";
import { ImageUpload } from "@/shared/components/ui/ImageUpload";
import { AvatarUploader } from "@/shared/components/ui/AvatarUploader";
import { Button } from "@/shared/components/ui/Button";
import { uploadImage } from "@/shared/utils/uploadImage";
import { cn } from "@/shared/utils/cn";
import type { CommunityDetailDTO } from "@/server/types/community.types";
import { useCommunityStore } from "../store/useCommunityStore";

interface EditCommunityModalProps {
  onClose: () => void;
  community: CommunityDetailDTO;
}

// Mounted only while the edit modal is open (see CommunityHeader), so useState
// initializers below always start from the current community — no reset effect needed.
export function EditCommunityModal({ onClose, community }: EditCommunityModalProps) {
  const { updating, updateCommunity } = useCommunityStore();
  const [description, setDescription] = useState(community.description);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(community.visibility);
  const [iconUrl, setIconUrl] = useState<string | null>(community.iconUrl);
  const [bannerUrl, setBannerUrl] = useState<string | null>(community.bannerUrl);

  const canSubmit = description.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || updating) return;
    const ok = await updateCommunity({
      description: description.trim(),
      visibility,
      iconUrl: iconUrl ?? undefined,
      bannerUrl: bannerUrl ?? undefined,
    });
    if (ok) onClose();
  }

  return (
    <Modal open onClose={onClose} title="Edit community">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Banner</label>
          <ImageUpload
            value={bannerUrl}
            onChange={setBannerUrl}
            onUpload={(file) => uploadImage(file, "community")}
            label="Add a banner"
            previewClassName="h-28"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Icon</label>
          <AvatarUploader
            name={community.name}
            value={iconUrl}
            onChange={setIconUrl}
            onUpload={(file) => uploadImage(file, "community")}
            label="Upload icon"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={500}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Visibility</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVisibility("PUBLIC")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all",
                visibility === "PUBLIC"
                  ? "border-brand-500 bg-brand-500/10 ring-4 ring-brand-500/10"
                  : "border-gray-800 hover:bg-gray-800"
              )}
            >
              <GlobeIcon className="size-4 text-gray-300" />
              <div>
                <p className="font-medium text-gray-100">Public</p>
                <p className="text-xs text-gray-400">Anyone can view and join</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setVisibility("PRIVATE")}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all",
                visibility === "PRIVATE"
                  ? "border-brand-500 bg-brand-500/10 ring-4 ring-brand-500/10"
                  : "border-gray-800 hover:bg-gray-800"
              )}
            >
              <LockIcon className="size-4 text-gray-300" />
              <div>
                <p className="font-medium text-gray-100">Private</p>
                <p className="text-xs text-gray-400">Invite only</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={updating}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
