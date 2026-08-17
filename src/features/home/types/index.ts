export const CURRENT_USERNAME = "kashyapkrlucky";

export const DEFAULT_PAGE_SIZE = 20;
export const MEMBERS_PAGE_SIZE = 30;

// Classic Reddit "hot" ranking gravity constant (seconds).
export const HOT_SCORE_EPOCH = new Date(2020, 0, 1).getTime();

export const POST_SORTS = ["top", "recent", "views", "hot"] as const;
export type PostSort = (typeof POST_SORTS)[number];

export const HOME_FEED_SCOPE = "home";
export const COMMUNITY_FEED_SCOPE = "community";

export interface Post {
    id: string;
    community: {
        id: string;
        name: string;
        slug: string;
    };
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    tags?: string[];
    author: {
        id: string;
        name: string;
        avatar: string;
    };
}
