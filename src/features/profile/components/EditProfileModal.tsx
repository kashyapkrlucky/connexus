"use client";

import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import type { UserProfileDTO } from "@/server/types/user.types";
import { ProfileEditFields } from "./ProfileEditFields";

interface EditProfileModalProps {
  onClose: () => void;
  profile: UserProfileDTO;
}

export function EditProfileModal({ onClose, profile }: EditProfileModalProps) {
  return (
    <Modal open onClose={onClose} title="Edit profile">
      <ProfileEditFields
        profile={profile}
        onSaved={onClose}
        extraActions={
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        }
      />
    </Modal>
  );
}
