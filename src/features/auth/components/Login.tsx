
import { useState } from "react";
import { Modal } from "@/shared/components/layout/Modal";
import { LoginActions } from "./LoginActions";

export function Login() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="rounded-lg bg-accent px-2.5 py-1 text-sm font-medium text-accent-foreground"
      >
        Login
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-lg font-semibold text-accent">Sign in to Connexus</h2>
        <LoginActions />
      </Modal>
    </>
  );
}
