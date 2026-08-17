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
    getMemberships: () => {
        set({
            memberships: [{
                id: "1",
                community: {
                    id: "1",
                    name: "Community 1",
                    slug: "community-1",
                    iconUrl: "/com.jpeg"
                }
            }], loading: false
        });
    },
    topCommunities: [],
    getTopCommunities: () => {
        set({
            topCommunities: [{
                id: "1",
                name: "Community 1",
                slug: "community-1",
                iconUrl: "/com.jpeg",
                _count: { members: 100 }
            }], loading: false
        });
    },
}));