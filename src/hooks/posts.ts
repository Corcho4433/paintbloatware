import { useEffect, useState, useCallback, useRef } from "react";
import { PostPage, PostResponse, PostIDResponse } from "../types/requests";
import { serverPath } from "../utils/servers";
import { NoMoreDataAvailableError, NoPostsMadeYet } from "../types/errors";
import fetchWithRefresh from "./authorization";
// NOTE: Keep exports stable (hooks only). Avoid adding conditional exports to preserve Fast Refresh compatibility.

interface UsePostsOptions {
  initialPage?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  userId?: string; 
  tag?: string; // Add tag parameter
  trending?: boolean; // Add trending parameter
}

interface UseRandomizedPosts {
  initialPage?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  userId?: string; 
}

export function usePostById(postId: string | null) {
  const [post, setPost] = useState<PostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      console.log("Fetching post with ID:", postId);
      try {
        setLoading(true);
        const res = await fetch(`${serverPath}/api/posts/${postId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch post: ${res.statusText}`);
        const data: PostIDResponse = await res.json();
        setPost(data.post); // Assuming API returns a PostResponse with one post
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  return { post, loading, error };
}

export function usePosts(options: UsePostsOptions = {}) {
  const { 
    initialPage = 1, 
    autoRefresh = false, 
    refreshInterval = 30000, // 30 seconds default
    userId = null,
    tag = null,
    trending = false // Add tag parameter
  } = options;

  const [posts, setPosts] = useState<PostPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cache for prefetched pages
  const [pageCache] = useState(new Map<number, PostPage>());

  const fetchPosts = useCallback(async (page: number = 1, useCache: boolean = true) => {
    // Check cache first
    if (useCache && pageCache.has(page)) {

      return pageCache.get(page)!;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    // Build URL based on parameters
    let url: string;
    if (userId) {
      url = `${serverPath}/api/posts/user/${userId}?page=${page}`;
    } else if (tag) {
      url = `${serverPath}/api/posts/tag/${encodeURIComponent(tag)}?page=${page}`;
    } else if (trending) {
      url = `${serverPath}/api/posts/trending?page=${page}`;
    } else {
      url = `${serverPath}/api/posts?page=${page}`;
    }
    
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: abortControllerRef.current.signal,
    });

    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
    const data: PostPage = await res.json();
    
    if (data.totalCount === 0){
      throw new NoPostsMadeYet("No posts made yet")
    }
    
    // Cache the result
    pageCache.set(page, data);
    
    return data;
  }, [pageCache, userId, tag]);

  const load = useCallback(async (page: number = currentPage, isRefresh: boolean = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      
      const data = await fetchPosts(page, !isRefresh);
      setPosts(data);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, fetchPosts]);

  // Initial load
  useEffect(() => {
    load(initialPage);
  }, [initialPage]); // Only depend on initialPage, not load

  // Reset and reload when userId or tag changes
  useEffect(() => {
    setLoading(true);
    setPosts(null);
    setError(null);
    setCurrentPage(initialPage);
    pageCache.clear();
    load(initialPage);
  }, [userId, tag]); // When these change, reload everything

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        load(currentPage, true);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, currentPage]); // Don't include load in dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Prefetch next and previous pages
  const prefetch = useCallback(async (page: number) => {
    try {
      await fetchPosts(page, false);
    } catch (err) {
      // Silently fail prefetch attempts
      console.warn(`Failed to prefetch page ${page}:`, err);
    }
  }, [fetchPosts]);

  // Load specific page
  const goToPage = useCallback(async (page: number) => {
    if (page === currentPage) return;
    
    setLoading(true);
    await load(page);
    
    // Prefetch adjacent pages
    if (page > 1) prefetch(page - 1);
    prefetch(page + 1);
  }, [currentPage, load, prefetch]);

  // Load next page
  const nextPage = useCallback(async () => {
    const next = currentPage + 1;
    await goToPage(next);
  }, [currentPage, goToPage]);

  // Load previous page
  const previousPage = useCallback(async () => {
    if (currentPage <= 1) return;
    const prev = currentPage - 1;
    await goToPage(prev);
  }, [currentPage, goToPage]);

  // Refresh current page
  const refresh = useCallback(async () => {
    // Clear cache for current page to force fresh data
    pageCache.delete(currentPage);
    await load(currentPage, true);
  }, [currentPage, load, pageCache]);

  // Load more posts (infinite scroll)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !posts?.posts?.length) return;

    // Check if we're already at the last page
    if (posts && currentPage >= posts.maxPages) {
      console.log("No more pages available");
      setIsLoadingMore(false);
      throw new NoMoreDataAvailableError();
    }

    setIsLoadingMore(true);
    try {
      const nextPageData = await fetchPosts(currentPage + 1, false);
      if (nextPageData.posts?.length > 0) {
        setPosts(prev => ({
          ...nextPageData,
          posts: [...(prev?.posts || []), ...nextPageData.posts]
        }));
        setCurrentPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, posts, currentPage, fetchPosts]);

  // Get cached pages info
  const getCacheInfo = useCallback(() => {
    return {
      cachedPages: Array.from(pageCache.keys()).sort((a, b) => a - b),
      cacheSize: pageCache.size
    };
  }, [pageCache]);

  // Clear cache manually
  const clearCache = useCallback(() => {
    pageCache.clear();
  }, [pageCache]);

  return {
    // State
    posts,
    loading,
    error,
    currentPage,
    isRefreshing,
    isLoadingMore,
    
    // Navigation
    goToPage,
    nextPage,
    previousPage,
    
    // Data management
    refresh,
    loadMore,

    
    // Prefetching
    prefetch,
    
    // Cache management
    getCacheInfo,
    clearCache,
    setPosts,
    
    // Computed values
    hasNextPage: posts?.posts ? posts.posts.length >= 10 : false, // Assuming 10 posts per page
    hasPreviousPage: currentPage > 1,
  };
}

async function createRating(post_id: string, rating: number) {
  return await fetch(`${serverPath}/api/ratings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_id: post_id,
      rating: rating,
    }), 
    credentials: "include",
  })
}

export async function likePost(post_id: string) {
  return await createRating(post_id, 1);
}

export async function dislikePost(post_id: string) {
  return await createRating(post_id, -1);
}

interface PostPacket {
  image: string;
  description: string;
  source: string;
  tags: string[];
}

export async function createPost(sentPacket: PostPacket, callback: any) {
  return await fetchWithRefresh(serverPath + "/api/posts", {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json', 
      },
      body: JSON.stringify(sentPacket),
      credentials: 'include',
  })
      .then(response => response.json())
      .then(data => {
          callback(data);
      })
      .catch(error => {
          console.error('Error posting data: ', error);
      });
}





export function useRandomizedPosts(options: UseRandomizedPosts = {}) {
  const { 
    initialPage = 1, 
    autoRefresh = false, 
    refreshInterval = 30000, // 30 seconds default
    userId: loggedId = null,
  } = options;

  const [posts, setPosts] = useState<PostPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cache for prefetched pages
  const [pageCache] = useState(new Map<number, PostPage>());

  const fetchPosts = useCallback(async (page: number = 1, useCache: boolean = true) => {
    // Check cache first
    if (useCache && pageCache.has(page)) {

      return pageCache.get(page)!;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    // Build URL based on parameters
    let url: string;
    if (loggedId) {
      url = `${serverPath}/api/posts/feed/?page=${page}`;
    } else {
      url = `${serverPath}/api/posts?page=${page}`;
    }

    const res = await fetchWithRefresh(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: abortControllerRef.current.signal,
    });

    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
    const data: PostPage = await res.json();
    
    if (data.totalCount === 0){
      throw new NoPostsMadeYet("No posts made yet")
    }
    
    // Cache the result
    pageCache.set(page, data);
    
    return data;
  }, [pageCache, loggedId]);

  const load = useCallback(async (page: number = currentPage, isRefresh: boolean = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      
      const data = await fetchPosts(page, !isRefresh);
      setPosts(data);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, fetchPosts]);

  // Initial load
  useEffect(() => {
    load(initialPage);
  }, [initialPage]); // Only depend on initialPage, not load

  // Reset and reload when userId or tag changes
  useEffect(() => {
    setLoading(true);
    setPosts(null);
    setError(null);
    setCurrentPage(initialPage);
    pageCache.clear();
    load(initialPage);
  }, [loggedId]); // When these change, reload everything

  // Auto refresh setup
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        load(currentPage, true);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, currentPage]); // Don't include load in dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Prefetch next and previous pages
  const prefetch = useCallback(async (page: number) => {
    try {
      await fetchPosts(page, false);
    } catch (err) {
      // Silently fail prefetch attempts
      console.warn(`Failed to prefetch page ${page}:`, err);
    }
  }, [fetchPosts]);

  // Load specific page
  const goToPage = useCallback(async (page: number) => {
    if (page === currentPage) return;
    
    setLoading(true);
    await load(page);
    
    // Prefetch adjacent pages
    if (page > 1) prefetch(page - 1);
    prefetch(page + 1);
  }, [currentPage, load, prefetch]);

  // Load next page
  const nextPage = useCallback(async () => {
    const next = currentPage + 1;
    await goToPage(next);
  }, [currentPage, goToPage]);

  // Load previous page
  const previousPage = useCallback(async () => {
    if (currentPage <= 1) return;
    const prev = currentPage - 1;
    await goToPage(prev);
  }, [currentPage, goToPage]);

  // Refresh current page
  const refresh = useCallback(async () => {
    // Clear cache for current page to force fresh data
    pageCache.delete(currentPage);
    await load(currentPage, true);
  }, [currentPage, load, pageCache]);

  // Load more posts (infinite scroll)
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !posts?.posts?.length) return;

    // Check if we're already at the last page
    if (posts && currentPage >= posts.maxPages) {
      console.log("No more pages available");
      setIsLoadingMore(false);
      throw new NoMoreDataAvailableError();
    }

    setIsLoadingMore(true);
    try {
      const nextPageData = await fetchPosts(currentPage + 1, false);
      if (nextPageData.posts?.length > 0) {
        setPosts(prev => ({
          ...nextPageData,
          posts: [...(prev?.posts || []), ...nextPageData.posts]
        }));
        setCurrentPage(prev => prev + 1);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, posts, currentPage, fetchPosts]);

  // Get cached pages info
  const getCacheInfo = useCallback(() => {
    return {
      cachedPages: Array.from(pageCache.keys()).sort((a, b) => a - b),
      cacheSize: pageCache.size
    };
  }, [pageCache]);

  // Clear cache manually
  const clearCache = useCallback(() => {
    pageCache.clear();
  }, [pageCache]);

  return {
    // State
    posts,
    loading,
    error,
    currentPage,
    isRefreshing,
    isLoadingMore,
    
    // Navigation
    goToPage,
    nextPage,
    previousPage,
    
    // Data management
    refresh,
    loadMore,

    
    // Prefetching
    prefetch,
    
    // Cache management
    getCacheInfo,
    clearCache,
    setPosts,
    
    // Computed values
    hasNextPage: posts?.posts ? posts.posts.length >= 10 : false, // Assuming 10 posts per page
    hasPreviousPage: currentPage > 1,
  };
}