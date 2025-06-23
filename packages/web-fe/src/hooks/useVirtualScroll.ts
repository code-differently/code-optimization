import { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside visible area
}

interface VirtualScrollResult<T> {
  virtualItems: Array<{
    index: number;
    start: number;
    end: number;
    item: T;
  }>;
  totalHeight: number;
  scrollElementProps: {
    ref: React.RefObject<HTMLDivElement>;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    style: React.CSSProperties;
  };
  containerStyle: React.CSSProperties;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
): VirtualScrollResult<T> {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const virtualItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const virtual = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtual.push({
        index: i,
        start: i * itemHeight,
        end: (i + 1) * itemHeight,
        item: items[i],
      });
    }

    return virtual;
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    virtualItems,
    totalHeight,
    scrollElementProps: {
      ref: scrollElementRef,
      onScroll: handleScroll,
      style: {
        height: containerHeight,
        overflow: 'auto',
      },
    },
    containerStyle: {
      height: totalHeight,
      position: 'relative',
    },
  };
}
