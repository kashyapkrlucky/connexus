"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Input } from "@/shared/components/ui/Input";
import { Textarea } from "@/shared/components/ui/Textarea";
import { AvatarUploader } from "@/shared/components/ui/AvatarUploader";
import { Button } from "@/shared/components/ui/Button";
import { uploadImage } from "@/shared/utils/uploadImage";
import type { UserProfileDTO } from "@/server/types/user.types";
import { useProfileStore } from "../store/useProfileStore";

interface EditProfileModalProps {
  onClose: () => void;
  profile: UserProfileDTO;
}

// Mounted only while the edit modal is open (see the profile page), so useState
// initializers below always start from the current profile — no reset effect needed.
export function EditProfileModal({ onClose, profile }: EditProfileModalProps) {
  const { updating, updateProfile } = useProfileStore();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);

  const canSubmit = displayName.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || updating) return;
    const ok = await updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      avatarUrl: avatarUrl ?? undefined,
    });
    if (ok) onClose();
  }

  return (
    <Modal open onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Avatar</label>
          <AvatarUploader
            name={displayName || profile.username}
            value={avatarUrl}
            onChange={setAvatarUrl}
            onUpload={(file) => uploadImage(file, "post")}
            label="Upload avatar"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Display name</label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-200">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Tell people about yourself..."
          />
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
