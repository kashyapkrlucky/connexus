"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/shared/components/ui/Button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.48 0-.72-.06-1.41-.18-2.03H12z" />
      <path fill="#34A853" d="M5.28 14.3l-.74.57-2.63 2.05C3.58 20.2 7.53 22.5 12 22.5c3 0 5.52-.99 7.36-2.69l-3.3-2.56c-.9.61-2.07.98-4.06.98-2.9 0-5.36-1.96-6.24-4.6z" />
      <path fill="#4A90E2" d="M1.91 6.92A10.4 10.4 0 0 0 1.5 12c0 1.7.41 3.3 1.13 4.72l3.37-2.62A6.3 6.3 0 0 1 5.68 12c0-.73.13-1.43.35-2.1z" />
      <path fill="#FBBC05" d="M12 5.4c1.63 0 3.09.56 4.24 1.66l2.92-2.92C17.51 2.6 15 1.5 12 1.5 7.53 1.5 3.58 3.8 1.91 6.92L5.28 9.5C6.16 6.86 8.62 5.4 12 5.4z" />
    </svg>
  );
}

export function GoogleSignInButton() {
  const [redirecting, setRedirecting] = useState(false);

  const handleClick = () => {
    setRedirecting(true);
    signIn("google", { redirectTo: window.location.href });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      loading={redirecting}
      variant="primary"
      size="md"
      className="w-full justify-center"
    >
      {!redirecting && <GoogleIcon />} Continue with Google
    </Button>
  );
}
