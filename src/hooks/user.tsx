import { useEffect, useState } from "react";
import { GetCommentsByPostResponse, Comment } from "../types/requests";
import { serverPath } from "../utils/servers";

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(serverPath + `/api/comments/${postId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data: GetCommentsByPostResponse = await res.json();
        setComments(data.comments);
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
      const data: GetCommentsByPostResponse = await res.json();
      setComments(data.comments);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    try {
      const res = await fetch(serverPath + `/api/comments/${postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      const data = await res.json();
      
      // Add the new comment to the current comments array
      if (comments) {
        setComments([...comments, data.new_comment]);
      } else {
        setComments([data.new_comment]);
      }
      
      return data.new_comment;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { comments, loading, error, refetch, addComment };
}