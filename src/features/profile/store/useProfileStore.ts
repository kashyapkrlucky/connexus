import { create } from "zustand";
import { toast } from "sonner";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import { voteDelta } from "@/shared/utils/vote";
import type { UserProfileDTO, UserScoreDTO } from "@/server/types/user.types";
import type { PostDTO } from "@/server/types/post.types";
import type { Paginated } from "@/server/types/common.types";
import type { PostSort } from "@/shared/constants";

const PAGE_SIZE = 20;

interface UpdateProfilePayload {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

interface ProfileStore {
  profile: UserProfileDTO | null;
  profileLoading: boolean;
  profileNotFound: boolean;
  getProfile: (username: string) => Promise<void>;
  reset: () => void;

  ownScore: UserScoreDTO | null;
  getOwnScore: () => Promise<void>;

  posts: PostDTO[];
  postsTotal: number;
  postsPage: number;
  postsPageSize: number;
  postsHasMore: boolean;
  postsLoading: boolean;
  postsSort: PostSort;
  setPostsSort: (sort: PostSort) => void;
  getPosts: (username: string, page?: number) => Promise<void>;
  votePost: (postId: string, value: "UP" | "DOWN") => Promise<void>;

  updating: boolean;
  updateProfile: (input: UpdateProfilePayload) => Promise<boolean>;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  profileLoading: false,
  profileNotFound: false,
  getProfile: async (username) => {
    set({ profileLoading: true, profileNotFound: false });
    try {
      const { data } = await internalApi.get<UserProfileDTO>(`/v1/users/${username}`);
      set({ profile: data });
    } catch {
      set({ profile: null, profileNotFound: true });
    } finally {
      set({ profileLoading: false });
    }
  },
  reset: () =>
    set({
      profile: null,
      profileNotFound: false,
      ownScore: null,
      posts: [],
      postsPage: 1,
      postsTotal: 0,
      postsHasMore: false,
      postsSort: "recent",
    }),

  ownScore: null,
  getOwnScore: async () => {
    try {
      const { data } = await internalApi.get<UserScoreDTO>("/v1/users/me/score");
      set({ ownScore: data });
    } catch (error) {
      console.error(error);
    }
  },

  posts: [],
  postsTotal: 0,
  postsPage: 1,
  postsPageSize: PAGE_SIZE,
  postsHasMore: false,
  postsLoading: false,
  postsSort: "recent",
  setPostsSort: (sort) => set({ postsSort: sort }),
  getPosts: async (username, page = 1) => {
    set({ postsLoading: true });
    try {
      const { data } = await internalApi.get<Paginated<PostDTO>>("/v1/posts", {
        params: { scope: "user", username, sort: get().postsSort, page, pageSize: PAGE_SIZE },
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

  updating: false,
  updateProfile: async (input) => {
    set({ updating: true });
    try {
      const { data } = await internalApi.patch<UserProfileDTO>("/v1/users/me", input);
      set({ profile: data });
      toast.success("Profile updated");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't update profile"));
      return false;
    } finally {
      set({ updating: false });
    }
  },
}));
