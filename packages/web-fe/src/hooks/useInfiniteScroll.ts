import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number; // Distance from bottom to trigger load (in pixels)
  rootMargin?: string;
}

interface UseInfiniteScrollResult {
  loadMoreRef: React.RefObject<HTMLDivElement>;
  isIntersecting: boolean;
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  hasMore: boolean,
  loading: boolean,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult {
  const { threshold = 100, rootMargin = '0px' } = options;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const isIntersectingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      isIntersectingRef.current = entry.isIntersecting;

      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, loading]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold: 0.1,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, rootMargin]);

  return {
    loadMoreRef,
    isIntersecting: isIntersectingRef.current,
  };
}
