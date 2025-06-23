'use client';

import { useEffect, useRef, useCallback } from 'react';

interface RenderingStats {
  componentMountTime: number;
  lastRenderTime: number;
  totalRenders: number;
  averageRenderTime: number;
  slowestRender: number;
  fastestRender: number;
  startTime: number;
}

// Global state for rendering performance
let globalRenderingStats: RenderingStats = {
  componentMountTime: 0,
  lastRenderTime: 0,
  totalRenders: 0,
  averageRenderTime: 0,
  slowestRender: 0,
  fastestRender: Infinity,
  startTime: Date.now(),
};

let renderTimes: number[] = [];

export const useRenderingPerformance = (componentName: string = 'Unknown') => {
  const mountTime = useRef<number>(0);
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const hasInitialized = useRef<boolean>(false);

  // Track component mount - only once
  useEffect(() => {
    if (!hasInitialized.current) {
      mountTime.current = performance.now();
      globalRenderingStats.componentMountTime = mountTime.current;
      hasInitialized.current = true;
    }
  }, []);

  // Track render timing without causing re-renders
  const trackRender = useCallback(() => {
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    if (renderStartTime.current > 0) {
      renderTimes.push(renderDuration);
      globalRenderingStats.totalRenders++;
      globalRenderingStats.lastRenderTime = renderDuration;
      renderCount.current++;

      // Update fastest/slowest
      if (renderDuration > globalRenderingStats.slowestRender) {
        globalRenderingStats.slowestRender = renderDuration;
      }
      if (renderDuration < globalRenderingStats.fastestRender) {
        globalRenderingStats.fastestRender = renderDuration;
      }

      // Calculate average
      const totalTime = renderTimes.reduce((sum, time) => sum + time, 0);
      globalRenderingStats.averageRenderTime = totalTime / renderTimes.length;
    }
  }, []);

  // Set render start time and track completion
  renderStartTime.current = performance.now();

  // Use setTimeout to track render completion without triggering re-render
  useEffect(() => {
    const timer = setTimeout(trackRender, 0);
    return () => clearTimeout(timer);
  }, [trackRender]);

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  };
};

export const getRenderingStats = (): RenderingStats & {
  paintTiming: PerformancePaintTiming[];
  navigationTiming: PerformanceNavigationTiming | null;
} => {
  // Get browser paint timing
  const paintTiming = performance.getEntriesByType('paint') as PerformancePaintTiming[];

  // Get navigation timing
  const navigationTiming =
    (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming) || null;

  return {
    ...globalRenderingStats,
    fastestRender:
      globalRenderingStats.fastestRender === Infinity ? 0 : globalRenderingStats.fastestRender,
    paintTiming,
    navigationTiming,
  };
};

export const resetRenderingStats = () => {
  globalRenderingStats = {
    componentMountTime: 0,
    lastRenderTime: 0,
    totalRenders: 0,
    averageRenderTime: 0,
    slowestRender: 0,
    fastestRender: Infinity,
    startTime: Date.now(),
  };
  renderTimes = [];
};
