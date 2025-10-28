import { PostPage } from "../types/requests";
import { UserInfo } from "./user";
import { Comment as CommentResponse } from "../types/requests";
import fetchWithRefresh from "./authorization";

export interface DashboardData { 
    userCount: number;
    postCount: number;
    commentCount: number;
    ratingCount: number;
}

export const verifyAdmin = async (): Promise<boolean> => {
  const response = await fetchWithRefresh("/api/admin/verify", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response.json();
  
  return response.status === 200;
};

export const useDashboardData = async ():Promise<DashboardData | null> => {
    const response = await fetchWithRefresh("/api/admin/dashboard", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data;
};

export const useGetAllUsers = async (page: number = 1, limit: number = 10): Promise<{ data: UserInfo[] | null; loadMore: () => Promise<UserInfo[] | null> }> => {
    const response = await fetchWithRefresh(`/api/admin/users?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  
  const data = !response.ok ? null : await response.json();
  
  const loadMore = async (): Promise<UserInfo[] | null> => {
    const nextResponse = await fetchWithRefresh(`/api/admin/users?page=${page + 1}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!nextResponse.ok) {
      return null;
    }
    return await nextResponse.json();
  };
  
  return { data, loadMore };
};

export const useGetAllPosts = async (page: number = 1, limit: number = 10): Promise<{ data: PostPage | null; loadMore: () => Promise<PostPage | null> }> => {
    const response = await fetchWithRefresh(`/api/admin/posts?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  
  const data = !response.ok ? null : await response.json() as PostPage;
  
  const loadMore = async (): Promise<PostPage | null> => {
    const nextResponse = await fetchWithRefresh(`/api/admin/posts?page=${page + 1}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!nextResponse.ok) {
      return null;
    }
    return await nextResponse.json() as PostPage;
  };
  
  return { data, loadMore };
};

export const useGetAllComments = async (page: number = 1, limit: number = 10): Promise<{ data: CommentResponse[] | null; loadMore: () => Promise<CommentResponse[] | null> }> => {
    const response = await fetchWithRefresh(`/api/admin/comments?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  
  const data = !response.ok ? null : await response.json();
  
  const loadMore = async (): Promise<CommentResponse[] | null> => {
    const nextResponse = await fetchWithRefresh(`/api/admin/comments?page=${page + 1}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!nextResponse.ok) {
      return null;
    }
    return await nextResponse.json();
  };
  
  return { data, loadMore };
};

export const useDeleteUser = async (userId: string): Promise<boolean> => {
    const response = await fetchWithRefresh(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response.json();
  return response.status === 200;
};

export const useDeleteComment = async (commentId: string): Promise<boolean> => {
    const response = await fetchWithRefresh(`/api/admin/comments/${commentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response.json();
  return response.status === 200;
};

export const useDeletePost = async (postId: string): Promise<boolean> => {
    const response = await fetchWithRefresh(`/api/admin/posts/${postId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response.json();
  return response.status === 200;
};
