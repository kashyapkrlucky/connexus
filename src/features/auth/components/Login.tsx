"use client"
import { useState } from "react";
import { LogInIcon } from "lucide-react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function Login() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setModalOpen(true)}>
        <LogInIcon className="size-4" /> Login
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Sign in to Connexus">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-400">
            Join communities built for real connections — sign in to post, comment, and vote.
          </p>
          <GoogleSignInButton />
        </div>
      </Modal>
    </>
  );
}
