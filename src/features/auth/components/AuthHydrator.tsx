"use client";

import { useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

export function AuthHydrator() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return null;
}
