"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { toast } from "sonner";

// Auth.js redirects failed sign-ins back to "/?error=<code>" (see `pages.error`).
function SignInErrorToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("error")) return;

    toast.error(
      params.get("error") === "AccessDenied"
        ? "Your Google account email must be verified to sign in."
        : "Sign in failed. Please try again.",
    );
    params.delete("error");
    const query = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (query ? `?${query}` : ""));
  }, []);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SignInErrorToast />
      {children}
    </SessionProvider>
  );
}
