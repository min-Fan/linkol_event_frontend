import React, { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

/**
 * 性能监控组件，用于监控组件渲染性能
 * 仅在开发环境下使用
 */
export function PerformanceMonitor({
  componentName,
  enabled = process.env.NODE_ENV === 'development',
}: {
  componentName: string;
  enabled?: boolean;
}) {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastRenderTimeRef = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });

  useEffect(() => {
    if (!enabled) return;

    const now = performance.now();
    const renderTime = now - lastRenderTimeRef.current;

    renderCountRef.current += 1;
    renderTimesRef.current.push(renderTime);

    // 只保留最近10次渲染的时间
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current = renderTimesRef.current.slice(-10);
    }

    const averageRenderTime =
      renderTimesRef.current.reduce((a, b) => a + b, 0) / renderTimesRef.current.length;

    setMetrics({
      renderCount: renderCountRef.current,
      lastRenderTime: renderTime,
      averageRenderTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize,
    });

    lastRenderTimeRef.current = now;

    // 在控制台输出性能信息
    console.log(`[Performance] ${componentName}:`, {
      renderCount: renderCountRef.current,
      lastRenderTime: renderTime.toFixed(2) + 'ms',
      averageRenderTime: averageRenderTime.toFixed(2) + 'ms',
      memoryUsage: (performance as any).memory?.usedJSHeapSize
        ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + 'MB'
        : 'N/A',
    });
  });

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        maxWidth: '200px',
      }}
    >
      <div>
        <strong>{componentName}</strong>
      </div>
      <div>Renders: {metrics.renderCount}</div>
      <div>Last: {metrics.lastRenderTime.toFixed(2)}ms</div>
      <div>Avg: {metrics.averageRenderTime.toFixed(2)}ms</div>
      {metrics.memoryUsage && <div>Memory: {Math.round(metrics.memoryUsage / 1024 / 1024)}MB</div>}
    </div>
  );
}

/**
 * 高阶组件，用于包装需要性能监控的组件
 */
export function withPerformanceMonitor<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    return (
      <>
        <PerformanceMonitor componentName={componentName} />
        <WrappedComponent {...props} />
      </>
    );
  };
}

/**
 * Hook 用于监控特定操作的性能
 */
export function usePerformanceMonitor(operationName: string) {
  const startTimeRef = useRef<number>(0);

  const start = () => {
    startTimeRef.current = performance.now();
  };

  const end = () => {
    const duration = performance.now() - startTimeRef.current;
    console.log(`[Performance] ${operationName}: ${duration.toFixed(2)}ms`);
    return duration;
  };

  return { start, end };
}
