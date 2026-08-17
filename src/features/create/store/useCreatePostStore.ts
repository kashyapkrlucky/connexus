import { create } from "zustand";

interface CreatePostState {
  title: string;
  setTitle: (title: string) => void;
}

export const useCreatePostStore = create<CreatePostState>((set) => ({
  title: "",
  setTitle: (title: string) => set({ title }),
}));