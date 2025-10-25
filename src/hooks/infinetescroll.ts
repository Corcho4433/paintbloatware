import { useEffect, useCallback, useRef, useState } from 'react';
import { NoMoreDataAvailableError } from '../types/errors';

interface UseInfiniteScrollProps {
  loadMore: () => void;
  isLoading: boolean;
  max_pages?: number; // Optional maximum number of pages to load
  rootMargin?: string; // How far from the viewport to trigger (e.g., '200px')
  root?: Element | null; // The scrollable container element
}

const useInfiniteScroll = ({
  loadMore,
  isLoading,
  rootMargin = '300%',
  root = null,
}: UseInfiniteScrollProps) => {
  const loadMoreRef = useRef(loadMore);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [noMoreData, setNoMoreData] = useState(false);
  const callingRef = useRef(false); // prevent rapid duplicate calls

  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  const handleIntersect = useCallback(async (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;

    if (!entry.isIntersecting || isLoading || noMoreData || callingRef.current) return;

    callingRef.current = true;
    try {
      const maybePromise = loadMoreRef.current();
      if (typeof maybePromise !== 'undefined' && maybePromise !== null && typeof (maybePromise as Promise<unknown>).then === 'function') {
        await maybePromise;
      }
    } catch (error) {
      if (error instanceof NoMoreDataAvailableError) {
        setNoMoreData(true);
        loadMoreRef.current = () => {};
        console.warn('No more data available');
      } else {
        console.error('Error loading more posts:', error);
      }
    } finally {
      callingRef.current = false;
    }
  }, [isLoading, noMoreData]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    console.log(root);
    const observer = new IntersectionObserver(handleIntersect, {
      root: root,
      rootMargin,
      threshold: 0
    });

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [handleIntersect, rootMargin, root]);

  return sentinelRef;
};

export default useInfiniteScroll;