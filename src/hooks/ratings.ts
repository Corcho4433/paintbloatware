import { useState, useCallback, useEffect } from "react";
import { serverPath } from "../utils/servers";
import fetchWithRefresh from "./authorization";
import { useAuthStore } from "../store/useAuthStore";

interface RatingState {
  liked: boolean;
  disliked: boolean;
  loading: boolean;
  error: string | null;
}

export function useRatings(postId: string | undefined, initialRatingValue?: number) {
  if (!postId) {
    return {
      liked: false,
      disliked: false,
      toggleDislike: async () => {},
      toggleLike: async () => {},
      createRating: async (value: 1 | -1 | 0) => {},
    }
  }
  const user = useAuthStore((state) => state.user);
  const [ratingState, setRatingState] = useState<RatingState>({
    liked: false,
    disliked: false,
    loading: false,
    error: null,
  });

  // Initialize state based on the post's ratingValue
  useEffect(() => {
    if (initialRatingValue !== undefined) {
      setRatingState(prev => ({
        ...prev,
        liked: initialRatingValue === 1,
        disliked: initialRatingValue === -1,
      }));
    } else {
      // If no initial rating value, reset to default state
      setRatingState(prev => ({
        ...prev,
        liked: false,
        disliked: false,
      }));
    }
  }, [initialRatingValue]);

  const createRating = useCallback(async (value: 1 | -1 | 0) => {
    if (!user) {
      throw new Error("User must be logged in to rate posts");
    }
    
    try {
      const response = await fetchWithRefresh(serverPath + "/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          value,
        }),
        credentials: "include",
      });
      console.log("Create rating response:", response);
      if (!response.ok) {
        throw new Error("Failed to create rating");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }, [postId, user]);

  const toggleLike = useCallback(async () => {
    const wasLiked = ratingState.liked;
    const wasDisliked = ratingState.disliked;

    // Optimistic update - update UI immediately, no loading state
    setRatingState(prev => ({
      ...prev,
      liked: !wasLiked,
      disliked: false, // Always clear dislike when toggling like
      error: null,
    }));

    // Send request in background without blocking UI
    try {
      if (wasLiked) {
        // User is removing like - send rating of 0
        await createRating(0);
      } else {
        await createRating(1);
      }
    } catch (error) {
      // Revert optimistic update on error
      setRatingState(prev => ({
        ...prev,
        liked: wasLiked,
        disliked: wasDisliked,
        error: error instanceof Error ? error.message : "Failed to toggle like",
      }));
      console.error("Failed to toggle like:", error);
    }
  }, [ratingState.liked, ratingState.disliked, createRating]);

  const toggleDislike = useCallback(async () => {
    const wasLiked = ratingState.liked;
    const wasDisliked = ratingState.disliked;

    // Optimistic update - update UI immediately, no loading state
    setRatingState(prev => ({
      ...prev,
      disliked: !wasDisliked,
      liked: false, // Always clear like when toggling dislike
      error: null,
    }));

    // Send request in background without blocking UI
    try {
      if (wasDisliked) {
        // User is removing dislike - send rating of 0
        await createRating(0);
      } else {
        await createRating(-1);
      }
    } catch (error) {
      // Revert optimistic update on error
      setRatingState(prev => ({
        ...prev,
        liked: wasLiked,
        disliked: wasDisliked,
        error: error instanceof Error ? error.message : "Failed to toggle dislike",
      }));
      console.error("Failed to toggle dislike:", error);
    }
  }, [ratingState.liked, ratingState.disliked, createRating]);

  return {
    ...ratingState,
    toggleLike,
    toggleDislike,
    createRating,
  };
}