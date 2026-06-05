/**
 * Monitoring and metrics utilities for RoboStage
 * Tracks performance, errors, and usage patterns
 */

export interface MetricEvent {
  type: string;
  operation: string;
  duration: number;
  success: boolean;
  timestamp: number;
  metadata?: Record<string, any>;
  error?: string;
}

export interface MetricsSnapshot {
  totalEvents: number;
  successCount: number;
  errorCount: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  operationCounts: Record<string, number>;
  errorCounts: Record<string, number>;
}

/**
 * Metrics collector for tracking application performance
 */
class MetricsCollector {
  private events: MetricEvent[] = [];
  private readonly maxEvents = 1000; // Keep last 1000 events in memory

  /**
   * Records a metric event
   */
  record(event: Omit<MetricEvent, "timestamp">): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    // Keep only recent events to avoid memory bloat
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log slow operations
    if (event.duration > 1000) {
      console.warn(
        `Slow operation detected: ${event.operation} took ${event.duration}ms`
      );
    }

    // Log errors
    if (!event.success && event.error) {
      console.error(
        `Operation failed: ${event.operation} - ${event.error}`
      );
    }
  }

  /**
   * Gets a snapshot of current metrics
   */
  getSnapshot(): MetricsSnapshot {
    if (this.events.length === 0) {
      return {
        totalEvents: 0,
        successCount: 0,
        errorCount: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        operationCounts: {},
        errorCounts: {},
      };
    }

    const successEvents = this.events.filter((e) => e.success);
    const errorEvents = this.events.filter((e) => !e.success);

    const durations = this.events.map((e) => e.duration);
    const totalDuration = durations.reduce((a, b) => a + b, 0);

    const operationCounts: Record<string, number> = {};
    const errorCounts: Record<string, number> = {};

    for (const event of this.events) {
      operationCounts[event.operation] = (operationCounts[event.operation] ?? 0) + 1;

      if (!event.success && event.error) {
        errorCounts[event.error] = (errorCounts[event.error] ?? 0) + 1;
      }
    }

    return {
      totalEvents: this.events.length,
      successCount: successEvents.length,
      errorCount: errorEvents.length,
      avgDuration: totalDuration / this.events.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      operationCounts,
      errorCounts,
    };
  }

  /**
   * Clears all recorded events
   */
  clear(): void {
    this.events = [];
  }

  /**
   * Gets events for a specific operation
   */
  getEvents(operation?: string): MetricEvent[] {
    if (!operation) return this.events;
    return this.events.filter((e) => e.operation === operation);
  }
}

// Global metrics instance
const metricsCollector = new MetricsCollector();

/**
 * Tracks an async operation with automatic timing and error handling
 */
export async function trackOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    metricsCollector.record({
      type: "operation",
      operation: operationName,
      duration,
      success: true,
      metadata,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    metricsCollector.record({
      type: "operation",
      operation: operationName,
      duration,
      success: false,
      error: errorMessage,
      metadata,
    });

    throw error;
  }
}

/**
 * Tracks a synchronous operation
 */
export function trackSyncOperation<T>(
  operationName: string,
  operation: () => T,
  metadata?: Record<string, any>
): T {
  const startTime = performance.now();

  try {
    const result = operation();
    const duration = performance.now() - startTime;

    metricsCollector.record({
      type: "operation",
      operation: operationName,
      duration,
      success: true,
      metadata,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    metricsCollector.record({
      type: "operation",
      operation: operationName,
      duration,
      success: false,
      error: errorMessage,
      metadata,
    });

    throw error;
  }
}

/**
 * Gets the current metrics snapshot
 */
export function getMetrics(): MetricsSnapshot {
  return metricsCollector.getSnapshot();
}

/**
 * Clears all collected metrics
 */
export function clearMetrics(): void {
  metricsCollector.clear();
}

/**
 * Gets events for a specific operation
 */
export function getOperationMetrics(operation: string): MetricEvent[] {
  return metricsCollector.getEvents(operation);
}

/**
 * Exports metrics in a format suitable for analytics
 */
export function exportMetrics(): {
  snapshot: MetricsSnapshot;
  recentEvents: MetricEvent[];
} {
  return {
    snapshot: getMetrics(),
    recentEvents: metricsCollector.getEvents().slice(-100), // Last 100 events
  };
}

/**
 * Prints a human-readable summary of metrics
 */
export function printMetricsSummary(): void {
  const metrics = getMetrics();

  console.log("\n=== Metrics Summary ===");
  console.log(`Total Events: ${metrics.totalEvents}`);
  console.log(`Success Rate: ${((metrics.successCount / metrics.totalEvents) * 100).toFixed(2)}%`);
  console.log(`Average Duration: ${metrics.avgDuration.toFixed(2)}ms`);
  console.log(`Min Duration: ${metrics.minDuration.toFixed(2)}ms`);
  console.log(`Max Duration: ${metrics.maxDuration.toFixed(2)}ms`);

  console.log("\n=== Operations ===");
  for (const [operation, count] of Object.entries(metrics.operationCounts)) {
    console.log(`${operation}: ${count}`);
  }

  if (Object.keys(metrics.errorCounts).length > 0) {
    console.log("\n=== Errors ===");
    for (const [error, count] of Object.entries(metrics.errorCounts)) {
      console.log(`${error}: ${count}`);
    }
  }
  console.log("===================\n");
}
