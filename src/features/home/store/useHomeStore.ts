import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import { create } from "zustand";
import { toast } from "sonner";
import type { PostDTO } from "@/server/types/post.types";
import type { CommunitySummaryDTO } from "@/server/types/community.types";
import type { Paginated } from "@/server/types/common.types";
import type { PostSort } from "../types";
import { voteDelta } from "@/shared/utils/vote";
import { appendUnique } from "@/shared/utils/paginate";

const PAGE_SIZE = 20;

type VoteValue = "UP" | "DOWN";

interface HomeStore {
  memberships: CommunitySummaryDTO[];
  loading: boolean;
  getMemberships: () => void;
  posts: PostDTO[];
  postsLoading: boolean;
  /** True while fetching page 2+; the list stays visible. */
  postsLoadingMore: boolean;
  postsPage: number;
  postsHasMore: boolean;
  getPosts: (sort: PostSort, page?: number) => Promise<void>;
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
  postsLoadingMore: false,
  postsPage: 1,
  postsHasMore: false,
  getPosts: async (sort, page = 1) => {
    if (page > 1 && (get().postsLoadingMore || !get().postsHasMore)) return;
    set(page === 1 ? { postsLoading: true } : { postsLoadingMore: true });
    try {
      const { data } = await internalApi.get<Paginated<PostDTO>>("/v1/posts", {
        params: { scope: "home", sort, page, pageSize: PAGE_SIZE },
      });
      set({
        posts: page === 1 ? data.items : appendUnique(get().posts, data.items),
        postsPage: data.page,
        postsHasMore: data.hasMore,
      });
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Couldn't load posts"));
    } finally {
      set({ postsLoading: false, postsLoadingMore: false });
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
