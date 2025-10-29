import { GetAllTagsResponse, PostPage, UserPageResponse } from "../types/requests";
import { CommentPageResponse } from "../types/requests";
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

export const useDashboardData = async (): Promise<DashboardData | null> => {
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

export const useCreateTag = async (name: string): Promise<boolean> => {
  const response = await fetchWithRefresh("/api/admin/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  return response.ok;
};

export const useGetAllUsers = async (page: number = 1, limit: number = 10): Promise<{ data: UserPageResponse | null; loadPage: (page: number) => Promise<UserPageResponse | null> }> => {
  const response = await fetchWithRefresh(`/api/admin/users?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = !response.ok ? null : await response.json();

  const loadPage = async (targetPage: number): Promise<UserPageResponse | null> => {
    const nextResponse = await fetchWithRefresh(`/api/admin/users?page=${targetPage}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!nextResponse.ok) {
      return null;
    }
    return await nextResponse.json();
  };

  return { data, loadPage };
};

export const useGetAllTags = async (): Promise<GetAllTagsResponse | null> => {
  const response = await fetchWithRefresh(`/api/admin/tags`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return null;
  }
  return await response.json();
};

export const useGetAllPosts = async (page: number = 1, limit: number = 10): Promise<{ data: PostPage | null; loadPage: (page: number) => Promise<PostPage | null> }> => {
  const response = await fetchWithRefresh(`/api/admin/posts?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = !response.ok ? null : await response.json() as PostPage;

  const loadPage = async (targetPage: number): Promise<PostPage | null> => {
    const nextResponse = await fetchWithRefresh(`/api/admin/posts?page=${targetPage}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!nextResponse.ok) {
      return null;
    }
    return await nextResponse.json() as PostPage;
  };

  return { data, loadPage };
};

export const useGetAllComments = async (page: number = 1, limit: number = 10): Promise<{ data: CommentPageResponse | null; loadPage: (page: number) => Promise<CommentPageResponse | null> }> => {
  const response = await fetchWithRefresh(`/api/admin/comments?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const data = !response.ok ? null : await response.json();

  const loadPage = async (targetPage: number): Promise<CommentPageResponse | null> => {
    const nextResponse = await fetchWithRefresh(`/api/admin/comments?page=${targetPage}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!nextResponse.ok) {
      return null;
    }
    return await nextResponse.json();
  };

  return { data, loadPage };
};


export const useDeleteUser = async (userId: string): Promise<boolean> => {
  const response = await fetchWithRefresh(`/api/admin/user/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response;
  return response.ok;
};



export const useDeleteComment = async (commentId: string): Promise<boolean> => {
  const response = await fetchWithRefresh(`/api/admin/comment/${commentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response;
  return response.ok;
};
export const useDeleteTag = async (tagName: string): Promise<boolean> => {
  const response = await fetchWithRefresh(`/api/admin/tag/${tagName}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response;
  return response.ok;
};
export const useDeletePost = async (postId: string): Promise<boolean> => {
  const response = await fetchWithRefresh(`/api/admin/post/${postId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response;
  return response.ok;
};

export const useCreateAdmin = async (userId: string): Promise<boolean> => {
  const response = await fetchWithRefresh(`/api/admin/admin/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response;
  return response.ok;
};

export const useDeleteAdmin = async (userId: string): Promise<boolean> => {
  const response = await fetchWithRefresh(`/api/admin/admin/${userId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    return false;
  }
  await response;
  return response.ok;
};
