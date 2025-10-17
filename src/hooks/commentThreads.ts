import { useState } from "react";
import { CommentThreadsResponse, CommentThread } from "../types/requests";
import { serverPath } from "../utils/servers";
import { NoMoreDataAvailableError } from "../types/errors";
import fetchWithRefresh from "./authorization";

export function useCommentThreads(commentId: string) {
  const [threads, setThreads] = useState<CommentThread[]>([]);
  const [page, setPage] = useState(0); // Start at 0, load on demand
  const [maxPages, setMaxPages] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadThreads = async (pageToLoad: number = 1) => {
    if (pageToLoad === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    try {
      const res = await fetch(
        `${serverPath}/api/comment-threads/comment/${commentId}?page=${pageToLoad}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      
      if (!res.ok) throw new Error("Failed to fetch threads");
      
      const data: CommentThreadsResponse = await res.json();
      
      if (pageToLoad === 1) {
        setThreads(data.threads);
        setHasLoaded(true);
      } else {
        setThreads((prev) => [...prev, ...data.threads]);
      }
      
      setMaxPages(data.maxPages);
      setTotalCount(data.totalCount);
      setPage(pageToLoad);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || loading) return;
    
    if (maxPages !== null && page >= maxPages) {
      throw new NoMoreDataAvailableError("No more threads available");
    }
    
    await loadThreads(page + 1);
  };

  const addThread = async (content: string) => {
    try {
      const res = await fetchWithRefresh(`${serverPath}/api/comment-threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, id_comment: commentId }),
      });
      
      if (!res.ok) throw new Error("Failed to create thread");
      
      const data = await res.json();
      console.log("Created thread:", data);
      // Add the new thread to the beginning of the array
      setThreads((prev) => [...prev, data.thread]);
      setTotalCount((prev) => prev + 1);
      
      return data.thread;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const initializeThreads = async () => {
    if (!hasLoaded) {
      await loadThreads(1);
    }
  };

  return {
    threads,
    totalCount,
    loading,
    isLoadingMore,
    error,
    hasLoaded,
    loadMore,
    addThread,
    initializeThreads,
  };
}
