import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import { create } from "zustand";
import { toast } from "sonner";
import type { PostDTO } from "@/server/types/post.types";
import type { CommunitySummaryDTO } from "@/server/types/community.types";
import type { Paginated } from "@/server/types/common.types";
import type { PostSort } from "../types";
import { voteDelta } from "@/shared/utils/vote";

type VoteValue = "UP" | "DOWN";

interface HomeStore {
  memberships: CommunitySummaryDTO[];
  loading: boolean;
  getMemberships: () => void;
  posts: PostDTO[];
  postsLoading: boolean;
  getPosts: (sort: PostSort) => Promise<void>;
  votePost: (postId: string, value: VoteValue) => Promise<void>;
}

export const useHomeStore = create<HomeStore>((set, get) => ({
  memberships: [],
  loading: false,
  getMemberships: async () => {
    try {
      const response = await internalApi.get("/v1/communities/by-user");
      const data = response.data;
      set({ memberships: data.communities, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },
  posts: [],
  postsLoading: false,
  getPosts: async (sort) => {
    set({ postsLoading: true });
    try {
      const { data } = await internalApi.get<Paginated<PostDTO>>("/v1/posts", {
        params: { scope: "home", sort },
      });
      set({ posts: data.items });
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Couldn't load posts"));
    } finally {
      set({ postsLoading: false });
    }
  },

  votePost: async (postId, value) => {
    const target = get().posts.find((p) => p.id === postId);
    if (!target) return;

    const nextValue = target.viewerVote === value ? "NONE" : value;
    const prevScore = target.score;
    const prevVote = target.viewerVote;
    const delta = voteDelta(prevVote, nextValue);

    set({
      posts: get().posts.map((p) =>
        p.id === postId ? { ...p, score: p.score + delta, viewerVote: nextValue === "NONE" ? null : nextValue } : p
      ),
    });

    try {
      const { data } = await internalApi.post<{ score: number; viewerVote: PostDTO["viewerVote"] }>(
        `/v1/posts/${postId}/vote`,
        { value: nextValue }
      );
      set({
        posts: get().posts.map((p) => (p.id === postId ? { ...p, score: data.score, viewerVote: data.viewerVote } : p)),
      });
    } catch (error) {
      set({
        posts: get().posts.map((p) => (p.id === postId ? { ...p, score: prevScore, viewerVote: prevVote } : p)),
      });
      toast.error(getErrorMessage(error, "Couldn't vote"));
    }
  },
}));
