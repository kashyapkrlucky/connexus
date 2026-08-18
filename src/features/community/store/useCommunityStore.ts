import { create } from "zustand";
import { toast } from "sonner";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import { voteDelta } from "@/shared/utils/vote";
import type { CommunityDetailDTO, CommunityGuidelineDTO } from "@/server/types/community.types";
import type { PostDTO } from "@/server/types/post.types";
import type { Paginated } from "@/server/types/common.types";
import type { PostSort } from "@/shared/constants";

const PAGE_SIZE = 20;

interface UpdateCommunityPayload {
  description?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  iconUrl?: string;
  bannerUrl?: string;
}

interface CommunityStore {
  community: CommunityDetailDTO | null;
  communityLoading: boolean;
  communityNotFound: boolean;
  getCommunity: (slug: string) => Promise<void>;
  reset: () => void;

  posts: PostDTO[];
  postsTotal: number;
  postsPage: number;
  postsPageSize: number;
  postsHasMore: boolean;
  postsLoading: boolean;
  postsSort: PostSort;
  setPostsSort: (sort: PostSort) => void;
  getPosts: (slug: string, page?: number) => Promise<void>;
  votePost: (postId: string, value: "UP" | "DOWN") => Promise<void>;

  membershipUpdating: boolean;
  toggleMembership: () => Promise<void>;

  updating: boolean;
  updateCommunity: (input: UpdateCommunityPayload) => Promise<boolean>;

  guidelinesSaving: boolean;
  saveGuidelines: (guidelines: { title: string; body: string }[]) => Promise<boolean>;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  community: null,
  communityLoading: false,
  communityNotFound: false,
  getCommunity: async (slug) => {
    set({ communityLoading: true, communityNotFound: false });
    try {
      const { data } = await internalApi.get<CommunityDetailDTO>(`/v1/communities/${slug}`);
      set({ community: data });
    } catch {
      set({ community: null, communityNotFound: true });
    } finally {
      set({ communityLoading: false });
    }
  },
  reset: () =>
    set({
      community: null,
      communityNotFound: false,
      posts: [],
      postsPage: 1,
      postsTotal: 0,
      postsHasMore: false,
      postsSort: "hot",
    }),

  posts: [],
  postsTotal: 0,
  postsPage: 1,
  postsPageSize: PAGE_SIZE,
  postsHasMore: false,
  postsLoading: false,
  postsSort: "hot",
  setPostsSort: (sort) => set({ postsSort: sort }),
  getPosts: async (slug, page = 1) => {
    set({ postsLoading: true });
    try {
      const { data } = await internalApi.get<Paginated<PostDTO>>("/v1/posts", {
        params: { scope: "community", communitySlug: slug, sort: get().postsSort, page, pageSize: PAGE_SIZE },
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

  membershipUpdating: false,
  toggleMembership: async () => {
    const community = get().community;
    if (!community) return;

    set({ membershipUpdating: true });
    try {
      if (community.viewerIsMember) {
        await internalApi.delete(`/v1/communities/${community.slug}/leave`);
      } else {
        await internalApi.post(`/v1/communities/${community.slug}/join`);
      }
      await get().getCommunity(community.slug);
    } catch (error) {
      toast.error(
        getErrorMessage(error, community.viewerIsMember ? "Couldn't leave community" : "Couldn't join community")
      );
    } finally {
      set({ membershipUpdating: false });
    }
  },

  updating: false,
  updateCommunity: async (input) => {
    const community = get().community;
    if (!community) return false;

    set({ updating: true });
    try {
      const { data } = await internalApi.patch<CommunityDetailDTO>(`/v1/communities/${community.slug}`, input);
      set({ community: data });
      toast.success("Community updated");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't update community"));
      return false;
    } finally {
      set({ updating: false });
    }
  },

  guidelinesSaving: false,
  saveGuidelines: async (guidelines) => {
    const community = get().community;
    if (!community) return false;

    set({ guidelinesSaving: true });
    try {
      const { data } = await internalApi.put<CommunityGuidelineDTO[]>(
        `/v1/communities/${community.slug}/guidelines`,
        { guidelines }
      );
      set({ community: { ...community, guidelines: data } });
      toast.success("Guidelines updated");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't update guidelines"));
      return false;
    } finally {
      set({ guidelinesSaving: false });
    }
  },
}));
