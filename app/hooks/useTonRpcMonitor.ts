import { useEffect, useRef, useState } from 'react';

interface RpcCall {
  method: string;
  address: string;
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
}

interface RpcStats {
  totalCalls: number;
  uniqueCalls: number;
  averageDuration: number;
  successRate: number;
  recentCalls: RpcCall[];
  duplicateCalls: number;
}

/**
 * TON RPC 调用监控 Hook
 * 用于监控和调试 TON RPC 调用，帮助识别重复调用问题
 */
export const useTonRpcMonitor = (enabled: boolean = process.env.NODE_ENV === 'development') => {
  const [stats, setStats] = useState<RpcStats>({
    totalCalls: 0,
    uniqueCalls: 0,
    averageDuration: 0,
    successRate: 0,
    recentCalls: [],
    duplicateCalls: 0,
  });

  const callsRef = useRef<RpcCall[]>([]);
  const callCountsRef = useRef<Map<string, number>>(new Map());
  const lastLogTimeRef = useRef<number>(0);

  // 记录 RPC 调用
  const logRpcCall = (
    method: string,
    address: string,
    duration: number,
    success: boolean,
    error?: string
  ) => {
    if (!enabled) return;

    const call: RpcCall = {
      method,
      address,
      timestamp: Date.now(),
      duration,
      success,
      error,
    };

    callsRef.current.push(call);

    // 只保留最近100次调用
    if (callsRef.current.length > 100) {
      callsRef.current = callsRef.current.slice(-100);
    }

    // 统计调用次数
    const callKey = `${method}_${address}`;
    const currentCount = callCountsRef.current.get(callKey) || 0;
    callCountsRef.current.set(callKey, currentCount + 1);

    // 更新统计信息
    updateStats();
  };

  // 更新统计信息
  const updateStats = () => {
    const calls = callsRef.current;
    const callCounts = callCountsRef.current;

    const totalCalls = calls.length;
    const uniqueCalls = callCounts.size;
    const duplicateCalls = Array.from(callCounts.values()).reduce(
      (sum, count) => sum + Math.max(0, count - 1),
      0
    );

    const successfulCalls = calls.filter((call) => call.success).length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    const averageDuration =
      totalCalls > 0 ? calls.reduce((sum, call) => sum + call.duration, 0) / totalCalls : 0;

    setStats({
      totalCalls,
      uniqueCalls,
      averageDuration,
      successRate,
      recentCalls: calls.slice(-10), // 最近10次调用
      duplicateCalls,
    });
  };

  // 定期输出统计信息
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // 每30秒输出一次统计信息
      if (now - lastLogTimeRef.current > 30000) {
        console.group('[TON RPC Monitor] Statistics');
        console.log(`Total calls: ${stats.totalCalls}`);
        console.log(`Unique calls: ${stats.uniqueCalls}`);
        console.log(`Duplicate calls: ${stats.duplicateCalls}`);
        console.log(`Success rate: ${stats.successRate.toFixed(2)}%`);
        console.log(`Average duration: ${stats.averageDuration.toFixed(2)}ms`);

        if (stats.recentCalls.length > 0) {
          console.log('Recent calls:');
          stats.recentCalls.forEach((call) => {
            console.log(
              `  ${call.method}(${call.address.slice(0, 8)}...): ${call.duration.toFixed(2)}ms ${call.success ? '✓' : '✗'}`
            );
          });
        }

        // 显示重复调用最多的方法
        const duplicateMethods = Array.from(callCountsRef.current.entries())
          .filter(([_, count]) => count > 1)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        if (duplicateMethods.length > 0) {
          console.log('Most duplicated calls:');
          duplicateMethods.forEach(([method, count]) => {
            console.log(`  ${method}: ${count} times`);
          });
        }

        console.groupEnd();
        lastLogTimeRef.current = now;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [enabled, stats]);

  // 清除统计信息
  const clearStats = () => {
    callsRef.current = [];
    callCountsRef.current.clear();
    updateStats();
  };

  // 获取重复调用的详细信息
  const getDuplicateCalls = () => {
    const duplicates = Array.from(callCountsRef.current.entries())
      .filter(([_, count]) => count > 1)
      .map(([method, count]) => ({
        method,
        count,
        calls: callsRef.current.filter((call) => `${call.method}_${call.address}` === method),
      }));

    return duplicates;
  };

  return {
    stats,
    logRpcCall,
    clearStats,
    getDuplicateCalls,
  };
};

/**
 * 创建 TON RPC 调用的包装器，自动记录调用信息
 */
export const createTonRpcWrapper = (monitor: ReturnType<typeof useTonRpcMonitor>) => {
  const originalGetBalance = require('@libs/ton-client-optimized').getCachedBalance;
  const originalRunMethod = require('@libs/ton-client-optimized').getCachedRunMethod;

  return {
    async getBalance(address: any) {
      const startTime = performance.now();
      try {
        const result = await originalGetBalance(address);
        const duration = performance.now() - startTime;
        monitor.logRpcCall('getBalance', address.toString(), duration, true);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        monitor.logRpcCall('getBalance', address.toString(), duration, false, error.message);
        throw error;
      }
    },

    async runMethod(address: any, method: string, params: any[] = []) {
      const startTime = performance.now();
      try {
        const result = await originalRunMethod(address, method, params);
        const duration = performance.now() - startTime;
        monitor.logRpcCall(`runMethod.${method}`, address.toString(), duration, true);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        monitor.logRpcCall(
          `runMethod.${method}`,
          address.toString(),
          duration,
          false,
          error.message
        );
        throw error;
      }
    },
  };
};
