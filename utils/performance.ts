/**
 * Debounce utility for frontend performance optimization
 * Prevents excessive function calls while user is typing or scrolling
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle utility for performance-critical operations
 * Ensures function runs at most once per specified interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request idle callback wrapper for non-urgent operations
 * Offloads work to the browser's idle time
 */
export function scheduleIdleTask(callback: () => void): void {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(callback, 1);
  }
}

/**
 * Performance observer for measuring component render times
 */
export function measureComponentPerformance(componentName: string): {
  mark: () => void;
  measure: () => number;
} {
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  const measureName = `${componentName}-duration`;

  return {
    mark() {
      if ("performance" in window) {
        performance.mark(startMark);
      }
    },
    measure() {
      if ("performance" in window) {
        performance.mark(endMark);
        try {
          performance.measure(measureName, startMark, endMark);
          const measure = performance.getEntriesByName(measureName)[0];
          const duration = measure.duration;
          
          // Clean up marks and measures
          performance.clearMarks(startMark);
          performance.clearMarks(endMark);
          performance.clearMeasures(measureName);
          
          return duration;
        } catch (error) {
          console.error(`Failed to measure ${componentName}:`, error);
          return 0;
        }
      }
      return 0;
    },
  };
}

/**
 * Request animation frame batch updates for smooth animations
 */
export function batchAnimationUpdates(
  callback: () => void,
  immediate: boolean = false
): void {
  if (immediate) {
    callback();
  }

  if ("requestAnimationFrame" in window) {
    requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16); // ~60fps fallback
  }
}
