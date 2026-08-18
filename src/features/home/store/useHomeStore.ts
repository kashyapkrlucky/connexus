import internalApi from "@/lib/http/internal";
import { create } from "zustand";

interface HomeStore {
    memberships: any[];
    loading: boolean;
    getMemberships: () => void;
    topCommunities: any[];
    getTopCommunities: () => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
    memberships: [],
    loading: false,
    getMemberships: async () => {
       try {
        const response = await internalApi.get("/v1/communities/by-user");
        const data = response.data;
        console.log(data);
        set({ memberships: data.communities, loading: false });
       } catch (error) {
        console.error(error);
        set({ loading: false });
       }
    },
    topCommunities: [],
    getTopCommunities: async () => {
        try {
            const response = await internalApi.get("/v1/communities");
            const data = response.data;
            console.log(data);
            set({ topCommunities: data.communities });
        } catch (error) {
            console.error(error);
        }
    },
}));