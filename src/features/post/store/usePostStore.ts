import { create } from "zustand";
import { toast } from "sonner";
import internalApi from "@/lib/http/internal";
import { getErrorMessage } from "@/lib/http/errors";
import { voteDelta } from "@/shared/utils/vote";
import type { PostDTO } from "@/server/types/post.types";
import type { CommentDTO } from "@/server/types/comment.types";

function updateCommentInTree(
  comments: CommentDTO[],
  commentId: string,
  updater: (c: CommentDTO) => CommentDTO
): CommentDTO[] {
  return comments.map((c) => {
    if (c.id === commentId) return updater(c);
    if (c.replies.length > 0) return { ...c, replies: updateCommentInTree(c.replies, commentId, updater) };
    return c;
  });
}

function findComment(comments: CommentDTO[], commentId: string): CommentDTO | null {
  for (const c of comments) {
    if (c.id === commentId) return c;
    const found = findComment(c.replies, commentId);
    if (found) return found;
  }
  return null;
}

interface PostStore {
  post: PostDTO | null;
  postLoading: boolean;
  postNotFound: boolean;
  getPost: (id: string) => Promise<void>;
  reset: () => void;
  votePost: (postId: string, value: "UP" | "DOWN") => Promise<void>;
  deletePost: (postId: string) => Promise<boolean>;

  comments: CommentDTO[];
  commentsLoading: boolean;
  getComments: (postId: string) => Promise<void>;

  submittingComment: boolean;
  addComment: (postId: string, content: string, parentId?: string) => Promise<boolean>;

  voteComment: (commentId: string, value: "UP" | "DOWN") => Promise<void>;
  deleteComment: (commentId: string, postId: string) => Promise<boolean>;
}

export const usePostStore = create<PostStore>((set, get) => ({
  post: null,
  postLoading: false,
  postNotFound: false,
  getPost: async (id) => {
    set({ postLoading: true, postNotFound: false });
    try {
      const { data } = await internalApi.get<PostDTO>(`/v1/posts/${id}`);
      set({ post: data });
      internalApi.post(`/v1/posts/${id}/view`).catch(() => {});
    } catch {
      set({ post: null, postNotFound: true });
    } finally {
      set({ postLoading: false });
    }
  },
  reset: () => set({ post: null, postNotFound: false, comments: [] }),

  votePost: async (postId, value) => {
    const post = get().post;
    if (!post || post.id !== postId) return;

    const nextValue = post.viewerVote === value ? "NONE" : value;
    const prevScore = post.score;
    const prevVote = post.viewerVote;
    const delta = voteDelta(prevVote, nextValue);

    set({ post: { ...post, score: post.score + delta, viewerVote: nextValue === "NONE" ? null : nextValue } });

    try {
      const { data } = await internalApi.post<{ score: number; viewerVote: PostDTO["viewerVote"] }>(
        `/v1/posts/${postId}/vote`,
        { value: nextValue }
      );
      set((state) => (state.post ? { post: { ...state.post, score: data.score, viewerVote: data.viewerVote } } : state));
    } catch (error) {
      set((state) => (state.post ? { post: { ...state.post, score: prevScore, viewerVote: prevVote } } : state));
      toast.error(getErrorMessage(error, "Couldn't vote"));
    }
  },

  deletePost: async (postId) => {
    try {
      await internalApi.delete(`/v1/posts/${postId}`);
      toast.success("Post deleted");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete post"));
      return false;
    }
  },

  comments: [],
  commentsLoading: false,
  getComments: async (postId) => {
    set({ commentsLoading: true });
    try {
      const { data } = await internalApi.get<CommentDTO[]>(`/v1/posts/${postId}/comments`);
      set({ comments: data });
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't load comments"));
    } finally {
      set({ commentsLoading: false });
    }
  },

  submittingComment: false,
  addComment: async (postId, content, parentId) => {
    set({ submittingComment: true });
    try {
      await internalApi.post("/v1/comments", { postId, content, parentId });
      await get().getComments(postId);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't post comment"));
      return false;
    } finally {
      set({ submittingComment: false });
    }
  },

  voteComment: async (commentId, value) => {
    const target = findComment(get().comments, commentId);
    if (!target) return;

    const nextValue = target.viewerVote === value ? "NONE" : value;
    const prevScore = target.score;
    const prevVote = target.viewerVote;
    const delta = voteDelta(prevVote, nextValue);

    set({
      comments: updateCommentInTree(get().comments, commentId, (c) => ({
        ...c,
        score: c.score + delta,
        viewerVote: nextValue === "NONE" ? null : nextValue,
      })),
    });

    try {
      const { data } = await internalApi.post<{ score: number; viewerVote: CommentDTO["viewerVote"] }>(
        `/v1/comments/${commentId}/vote`,
        { value: nextValue }
      );
      set({
        comments: updateCommentInTree(get().comments, commentId, (c) => ({
          ...c,
          score: data.score,
          viewerVote: data.viewerVote,
        })),
      });
    } catch (error) {
      set({
        comments: updateCommentInTree(get().comments, commentId, (c) => ({ ...c, score: prevScore, viewerVote: prevVote })),
      });
      toast.error(getErrorMessage(error, "Couldn't vote"));
    }
  },

  deleteComment: async (commentId, postId) => {
    try {
      await internalApi.delete(`/v1/comments/${commentId}`);
      await get().getComments(postId);
      toast.success("Comment deleted");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete comment"));
      return false;
    }
  },
}));
