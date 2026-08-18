import { create } from "zustand";
import { toast } from "sonner";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import type { CommunitySummaryDTO, TrendingCommunityDTO } from "@/server/types/community.types";
import type { UserScoreDTO } from "@/server/types/user.types";
import type { NewsItemDTO } from "@/server/types/news.types";

interface SidebarStore {
  trending: TrendingCommunityDTO[];
  trendingLoading: boolean;
  getTrending: (limit?: number) => Promise<void>;

  explore: CommunitySummaryDTO[];
  exploreLoading: boolean;
  getExplore: (limit?: number) => Promise<void>;

  score: UserScoreDTO | null;
  scoreLoading: boolean;
  getScore: () => Promise<void>;

  news: NewsItemDTO[];
  newsLoading: boolean;
  getNews: (limit?: number) => Promise<void>;

  joinCommunity: (slug: string) => Promise<void>;
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  trending: [],
  trendingLoading: false,
  getTrending: async (limit = 5) => {
    set({ trendingLoading: true });
    try {
      const { data } = await internalApi.get<{ communities: TrendingCommunityDTO[] }>("/v1/communities/trending", {
        params: { limit },
      });
      set({ trending: data.communities });
    } catch (error) {
      console.error(error);
    } finally {
      set({ trendingLoading: false });
    }
  },

  explore: [],
  exploreLoading: false,
  getExplore: async (limit = 5) => {
    set({ exploreLoading: true });
    try {
      const { data } = await internalApi.get<{ communities: CommunitySummaryDTO[] }>("/v1/communities/explore", {
        params: { limit },
      });
      set({ explore: data.communities });
    } catch (error) {
      console.error(error);
    } finally {
      set({ exploreLoading: false });
    }
  },

  score: null,
  scoreLoading: false,
  getScore: async () => {
    set({ scoreLoading: true });
    try {
      const { data } = await internalApi.get<UserScoreDTO>("/v1/users/me/score");
      set({ score: data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ scoreLoading: false });
    }
  },

  news: [],
  newsLoading: false,
  getNews: async (limit = 5) => {
    set({ newsLoading: true });
    try {
      const { data } = await internalApi.get<{ items: NewsItemDTO[] }>("/v1/news", { params: { limit } });
      set({ news: data.items });
    } catch (error) {
      console.error(error);
    } finally {
      set({ newsLoading: false });
    }
  },

  joinCommunity: async (slug) => {
    try {
      await internalApi.post(`/v1/communities/${slug}/join`);
      set({
        explore: get().explore.filter((c) => c.slug !== slug),
        trending: get().trending.map((c) => (c.slug === slug ? { ...c, viewerIsMember: true } : c)),
      });
      toast.success("Joined community");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't join community"));
    }
  },
}));
