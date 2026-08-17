import { create } from "zustand";

import axios from "@/lib/http/external";
import internalAxios from "@/lib/http/internal";

import {
  getStoredToken,
  setStoredToken,
} from "../utils";
import { IUser } from "../types";
import { getErrorMessage } from "@/lib/http/errors";
import { USER_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../constants";

export interface AuthState {
  user: IUser | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isGuestLoading: boolean;
  error: string | null;
  logout: () => void;
  clearError: () => void;
  initialize: () => Promise<void>;

  getUserData: (
    code: string,
  ) => Promise<{
    user: IUser;
    access_token: string;
    refresh_token: string;
  } | null>;
  onGuestLogin: () => Promise<{
    user: IUser;
    access_token: string;
    refresh_token: string;
  } | null>;
  getLoggedInUser: () => IUser | null;
  getToken: () => string | null;
  getRefreshedTokens: () => Promise<{
    access_token: string;
    refresh_token: string;
  }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredToken(USER_KEY) ? JSON.parse(getStoredToken(USER_KEY)!) : null,
  access_token: getStoredToken(ACCESS_TOKEN_KEY),
  refresh_token: getStoredToken(REFRESH_TOKEN_KEY),
  isAuthenticated: !!getStoredToken(ACCESS_TOKEN_KEY),
  loading: false,
  isGuestLoading: false,
  error: null,

  clearError: () => {
    set({ error: null });
  },

  initialize: async () => {
    set({ loading: true });
    try {
      const token = getStoredToken(ACCESS_TOKEN_KEY);
      const refreshToken = getStoredToken(REFRESH_TOKEN_KEY);
      const user = getStoredToken(USER_KEY);
      if (token && user) {
        set({
          access_token: token,
          refresh_token: refreshToken,
          isAuthenticated: true,
          user: JSON.parse(user),
        });
      }
      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: getErrorMessage(error),
      });
    }
  },

  getUserData: async (code: string) => {
    try {
      set({ loading: true });
      const {
        data: { data },
      } = await axios.post("/v1/public/session", {
        code,
      });
      const { user, access_token, refresh_token } = data;
      set({ user, access_token, refresh_token, isAuthenticated: true });

      if(user) {
        await internalAxios.post("/v1/users", { id: user.id, name: user.name, email: user.email });
      }
      setStoredToken(USER_KEY, JSON.stringify(user));
      setStoredToken(ACCESS_TOKEN_KEY, access_token);
      setStoredToken(REFRESH_TOKEN_KEY, refresh_token);
      return { user, access_token, refresh_token };
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to complete sign in."),
      });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  onGuestLogin: async () => {
    try {
      set({ isGuestLoading: true });
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
      const {
        data: { data },
      } = await axios.post("/v1/public/guest", { clientId });
      const { user, access_token, refresh_token } = data;
      set({ user, access_token, refresh_token, isAuthenticated: true });
      setStoredToken(USER_KEY, JSON.stringify(user));
      setStoredToken(ACCESS_TOKEN_KEY, access_token);
      setStoredToken(REFRESH_TOKEN_KEY, refresh_token);
      return { user, access_token, refresh_token };
    } catch (error) {
      set({
        error: getErrorMessage(error, "Failed to login as guest."),
      });
      return null;
    } finally {
      set({ isGuestLoading: false });
    }
  },
  getLoggedInUser: () => {
    return getStoredToken(USER_KEY)
      ? JSON.parse(getStoredToken(USER_KEY)!)
      : null;
  },
  getToken: () => {
    return getStoredToken(ACCESS_TOKEN_KEY);
  },
  logout: () => {
    setStoredToken(ACCESS_TOKEN_KEY, null);
    setStoredToken(REFRESH_TOKEN_KEY, null);
    setStoredToken(USER_KEY, null);
    set({
      user: null,
      access_token: null,
      refresh_token: null,
      isAuthenticated: false,
      error: null,
    });
  },
  getRefreshedTokens: async () => {
    const current_refresh_token = getStoredToken(REFRESH_TOKEN_KEY);

    if (!current_refresh_token) {
      throw new Error("Refresh token is missing.");
    }

    const {
      data: { data },
    } = await axios.post(`/v1/public/session/refresh`, {
      refresh_token: current_refresh_token,
    });

    const { access_token, refresh_token } = data;
    set({ access_token, refresh_token, isAuthenticated: true });
    setStoredToken(ACCESS_TOKEN_KEY, access_token);
    setStoredToken(REFRESH_TOKEN_KEY, refresh_token);

    return { access_token, refresh_token };
  },
}));

export default useAuthStore;
