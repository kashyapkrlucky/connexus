import { create } from "zustand";
import { toast } from "sonner";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import { voteDelta } from "@/shared/utils/vote";
import type { PostDTO } from "@/server/types/post.types";
import type { Paginated } from "@/server/types/common.types";
import type { PostSort } from "@/shared/constants";

const PAGE_SIZE = 20;

interface PopularStore {
  posts: PostDTO[];
  postsTotal: number;
  postsPage: number;
  postsPageSize: number;
  postsHasMore: boolean;
  postsLoading: boolean;
  postsSort: PostSort;
  setPostsSort: (sort: PostSort) => void;
  getPosts: (page?: number) => Promise<void>;
  votePost: (postId: string, value: "UP" | "DOWN") => Promise<void>;
}

export const usePopularStore = create<PopularStore>((set, get) => ({
  posts: [],
  postsTotal: 0,
  postsPage: 1,
  postsPageSize: PAGE_SIZE,
  postsHasMore: false,
  postsLoading: false,
  postsSort: "hot",
  setPostsSort: (sort) => set({ postsSort: sort }),
  getPosts: async (page = 1) => {
    set({ postsLoading: true });
    try {
      const { data } = await internalApi.get<Paginated<PostDTO>>("/v1/posts", {
        params: { scope: "popular", sort: get().postsSort, page, pageSize: PAGE_SIZE },
      });
      set({ posts: data.items, postsTotal: data.total, postsPage: data.page, postsHasMore: data.hasMore });
    } catch (error) {
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
