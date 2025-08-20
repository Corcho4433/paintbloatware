import { useEffect, useState } from "react";
import { PostPage } from "../types/requests";
import { serverPath } from "../utils/servers";

export function usePosts() {
  const [posts, setPosts] = useState<PostPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        console.log("Fetching posts from server...");
        const res = await fetch(serverPath + "/api/posts", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data: PostPage = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { posts, loading, error };
}
