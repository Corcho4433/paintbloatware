import { useEffect, useState, useCallback, useRef } from "react";
import { PostPage, Post, CreatePostRequest, PostResponse } from "../types/requests";
import { serverPath } from "../utils/servers";
import { NoMoreDataAvailableError } from "../types/errors";

interface UsePostsOptions {
  initialPage?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  userId?: string; 
}

export function usePosts(options: UsePostsOptions = {}) {
  const { 
    initialPage = 1, 
    autoRefresh = false, 
    refreshInterval = 30000, // 30 seconds default
    userId = null
  } = options;

  const [posts, setPosts] = useState<PostPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const intervalRef = useRef<number | null>(null);
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
    
    // Add userId to URL if provided
    const url = userId 
      ? `${serverPath}/api/posts/user/${userId}?page=${page}`
      : `${serverPath}/api/posts?page=${page}`;
    
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: abortControllerRef.current.signal,
    });

    

    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
    const data: PostPage = await res.json();
    
    console.log("data.maxPages", data);
    if (data.currentPage >= data.maxPages) {
      console.log("No more pages available");
      throw new NoMoreDataAvailableError("No more pages available");
    }
    // Cache the result
    pageCache.set(page, data);
    
    return data;
  }, [pageCache, userId]); // Add userId to dependencies

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
      if (err instanceof NoMoreDataAvailableError) {
        // Don't set this as an error state, it's expected behavior
        console.log("Reached end of posts");
      } else {
        setError(err as Error);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, posts, currentPage, fetchPosts]);

  // Add new post optimistically
  const addPost = useCallback(async (postData: CreatePostRequest) => {
    try {
      const res = await fetch(serverPath + "/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(postData),
      });

      if (!res.ok) throw new Error("Failed to create post");
      
      const response = await res.json();
      const newPost = response.post;

      // Convert Post to PostResponse format if needed
      // You might need to adjust this based on your actual types
      const newPostResponse = {
        ...newPost,
        // Add missing PostResponse properties with default values
        url_bucket: newPost.url_bucket || '',
        height: newPost.height || 0,
        width: newPost.width || 0,
        version: newPost.version || 1,
        // Add any other missing PostResponse properties
      };

      // Add to current posts optimistically
      setPosts(prev => {
        if (!prev) {
          return {
            posts: [newPostResponse],
            maxPages: 1,
            currentPage: 1,
            totalCount: 1,
          };
        }
        return {
          ...prev,
          posts: [newPostResponse, ...prev.posts],
          totalCount: prev.totalCount + 1,
        };
      });

      // Clear cache to ensure fresh data on next fetch
      pageCache.clear();

      return newPost;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [pageCache]);

  // Update post in local state
  const updatePost = useCallback((postId: string, updates: Partial<PostResponse>) => {
    setPosts(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.map(post => 
          post.id === postId ? { ...post, ...updates } : post
        )
      };
    });
  }, []);

  // Remove post from local state
  const removePost = useCallback((postId: string) => {
    setPosts(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.filter(post => post.id !== postId)
      };
    });
  }, []);

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
    addPost,
    updatePost,
    removePost,
    
    // Prefetching
    prefetch,
    
    // Cache management
    getCacheInfo,
    clearCache,
    
    // Computed values
    hasNextPage: posts?.posts ? posts.posts.length >= 10 : false, // Assuming 10 posts per page
    hasPreviousPage: currentPage > 1,
  };
}