import { CommunityService } from "./CommunityService";
import { PostService } from "./PostService";
import UserService from "./UserService";
import { CommunitySummaryDTO } from "../types/community.types";
import { PostDTO } from "../types/post.types";
import { UserSummary } from "../types/common.types";

const RESULTS_PER_CATEGORY = 5;

export interface SearchResultsDTO {
    communities: CommunitySummaryDTO[];
    posts: PostDTO[];
    users: UserSummary[];
}

export class SearchService {
    static async search(q: string, viewerId?: string | null): Promise<SearchResultsDTO> {
        const [communities, posts, users] = await Promise.all([
            CommunityService.getCommunities({ q, page: 1, pageSize: RESULTS_PER_CATEGORY }, viewerId),
            PostService.searchPosts(q, viewerId, RESULTS_PER_CATEGORY),
            UserService.searchUsers(q, RESULTS_PER_CATEGORY),
        ]);

        return { communities, posts, users };
    }
}
