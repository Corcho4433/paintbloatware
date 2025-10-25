import { useEffect, useState } from "react";
import { PostPageResponse } from "../types/requests";
import { serverPath } from "../utils/servers";
import { NoMoreDataAvailableError } from "../types/errors";
import fetchWithRefresh from "./authorization";

export function useComments(postId: string) {
  const [comments, setComments] = useState<PostPageResponse | null>(null);
  const [page, setPage] = useState(1);
  const [maxPages, setMaxPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(serverPath + `/api/comments/${postId}?page=${page}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data: PostPageResponse = await res.json();
        setComments(data);
        setMaxPages(data.maxPages);
        console.log("Fetched comments:", data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      load();
    }
  }, [postId]);

  const loadMore = async () => {
    if (isLoadingMore || loading) return;
    
    if (maxPages !== null && page >= maxPages) {
      throw new NoMoreDataAvailableError("No more comments available");
    }
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(serverPath + `/api/comments/${postId}?page=${nextPage}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch more comments");
      const data: PostPageResponse = await res.json();
      setPage(nextPage);
      setComments((prev) => {
        if (!prev) return data;
        return {
          ...data,
          comments: [...prev.comments, ...data.comments],
        } as PostPageResponse;
      });
      console.log("Fetched more comments:", data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(serverPath + `/api/comments/${postId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data: PostPageResponse = await res.json();
      setComments(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      const res = await fetchWithRefresh(serverPath + `/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      const data = await res.json();

      // Add the new comment to the current comments array
      if (comments) {
        setComments({ ...comments, comments: [...comments.comments, data.new_comment] });
      } else {
        setComments({ comments: [data.new_comment] } as PostPageResponse);
      }

      return data.new_comment;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { comments, loading, error, refetch, addComment, loadMore, isLoadingMore };
}