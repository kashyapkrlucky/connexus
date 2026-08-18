
export const DEFAULT_PAGE_SIZE = 20;
export const MEMBERS_PAGE_SIZE = 30;

// Classic Reddit "hot" ranking gravity constant (seconds).
export const HOT_SCORE_EPOCH = new Date(2020, 0, 1).getTime();

export const POST_SORTS = ["top", "recent", "views", "hot"] as const;
export type PostSort = (typeof POST_SORTS)[number];

export const HOME_FEED_SCOPE = "home";
export const COMMUNITY_FEED_SCOPE = "community";
