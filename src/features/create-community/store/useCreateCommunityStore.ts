import { create } from "zustand";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";

export type CommunityVisibility = "PUBLIC" | "PRIVATE";

interface CreateCommunityResult {
  communityId: string;
  slug: string;
}

interface CreateCommunityState {
  name: string;
  description: string;
  visibility: CommunityVisibility;
  iconUrl: string | null;
  bannerUrl: string | null;
  submitting: boolean;
  error: string | null;
  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setVisibility: (visibility: CommunityVisibility) => void;
  setIconUrl: (iconUrl: string | null) => void;
  setBannerUrl: (bannerUrl: string | null) => void;
  clearError: () => void;
  reset: () => void;
  submitCommunity: () => Promise<CreateCommunityResult | null>;
}

const initialState = {
  name: "",
  description: "",
  visibility: "PUBLIC" as CommunityVisibility,
  iconUrl: null as string | null,
  bannerUrl: null as string | null,
  submitting: false,
  error: null as string | null,
};

export const useCreateCommunityStore = create<CreateCommunityState>((set, get) => ({
  ...initialState,

  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setVisibility: (visibility) => set({ visibility }),
  setIconUrl: (iconUrl) => set({ iconUrl }),
  setBannerUrl: (bannerUrl) => set({ bannerUrl }),
  clearError: () => set({ error: null }),
  reset: () => set({ ...initialState }),

  submitCommunity: async () => {
    const { name, description, visibility, iconUrl, bannerUrl } = get();
    set({ submitting: true, error: null });
    try {
      const { data } = await internalApi.post<CreateCommunityResult>("/v1/communities", {
        name: name.trim(),
        description: description.trim(),
        visibility,
        iconUrl: iconUrl ?? undefined,
        bannerUrl: bannerUrl ?? undefined,
      });
      set({ ...initialState });
      return data;
    } catch (error) {
      set({ error: getErrorMessage(error, "Couldn't create community") });
      return null;
    } finally {
      set({ submitting: false });
    }
  },
}));

export default useCreateCommunityStore;
