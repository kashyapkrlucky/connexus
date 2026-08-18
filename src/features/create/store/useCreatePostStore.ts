import { create } from "zustand";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import type { PostDTO } from "@/server/types/post.types";

interface CreatePostState {
  communityId: string;
  title: string;
  content: string;
  imageUrl: string | null;
  submitting: boolean;
  error: string | null;
  setCommunityId: (communityId: string) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setImageUrl: (imageUrl: string | null) => void;
  clearError: () => void;
  reset: () => void;
  submitPost: () => Promise<PostDTO | null>;
}

const initialState = {
  communityId: "",
  title: "",
  content: "",
  imageUrl: null as string | null,
  submitting: false,
  error: null as string | null,
};

export const useCreatePostStore = create<CreatePostState>((set, get) => ({
  ...initialState,

  setCommunityId: (communityId) => set({ communityId }),
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  clearError: () => set({ error: null }),
  reset: () => set({ ...initialState }),

  submitPost: async () => {
    const { communityId, title, content, imageUrl } = get();
    set({ submitting: true, error: null });
    try {
      const { data } = await internalApi.post<PostDTO>("/v1/posts", {
        communityId,
        title: title.trim(),
        content: content.trim() || undefined,
        imageUrl: imageUrl ?? undefined,
      });
      set({ ...initialState });
      return data;
    } catch (error) {
      set({ error: getErrorMessage(error, "Couldn't create post") });
      return null;
    } finally {
      set({ submitting: false });
    }
  },
}));

export default useCreatePostStore;
