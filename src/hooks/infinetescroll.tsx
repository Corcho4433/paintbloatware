import { useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollProps {
  loadMore: () => void;
  isLoading: boolean;
  rootMargin?: string; // How far from the viewport to trigger (e.g., '200px')
}

const useInfiniteScroll = ({
  loadMore,
  isLoading,
  rootMargin = '700px'
}: UseInfiniteScrollProps) => {
  const loadMoreRef = useRef(loadMore);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  
  // Update ref when loadMore changes to avoid stale closures
  useEffect(() => {

    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    
    
    // Only load more if sentinel is visible, we have next page, and not currently loading
    if (entry.isIntersecting && !isLoading) {

      loadMoreRef.current();
    } else {
      const reasons = [];
      if (!entry.isIntersecting) reasons.push('sentinel not visible');
      if (isLoading) reasons.push('already loading');
      
      
    }
  }, [ isLoading]);

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