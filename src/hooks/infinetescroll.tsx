import { useEffect, useCallback, useRef, useState } from 'react';
import { NoMoreDataAvailableError } from '../types/errors';

interface UseInfiniteScrollProps {
  loadMore: () => void;
  isLoading: boolean;
  max_pages?: number; // Optional maximum number of pages to load
  rootMargin?: string; // How far from the viewport to trigger (e.g., '200px')
}

const useInfiniteScroll = ({
  loadMore,
  isLoading,
  rootMargin = '700px'
}: UseInfiniteScrollProps) => {
  const loadMoreRef = useRef(loadMore);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [noMoreData, setNoMoreData] = useState(false);
  
  
  // Update ref when loadMore changes to avoid stale closures
  useEffect(() => {

    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    
    
    // Only load more if sentinel is visible, we have next page, and not currently loading
    if (entry.isIntersecting && !isLoading && !noMoreData) {
      try {
        loadMoreRef.current();
      } catch (error) {
        if (error instanceof NoMoreDataAvailableError) {
          setNoMoreData(true);
          loadMoreRef.current = () => {}; // Disable further loading
          console.error("No more data available:", error);
        } else {
          console.error("Error loading more posts:", error);
        }
      }
    }
  }, [isLoading, noMoreData]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Create intersection observer
    const observer = new IntersectionObserver(handleIntersect, {
      root: null, // Use viewport as root
      rootMargin,
      threshold: 0., // Trigger when 10% of sentinel is visible
    });

    observer.observe(sentinel);

    // Cleanup
    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [handleIntersect, rootMargin]);

  // Return ref to attach to sentinel element
  return sentinelRef;
};

export default useInfiniteScroll;