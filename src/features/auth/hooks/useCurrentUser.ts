"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data, status } = useSession();

  return {
    user: data?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
