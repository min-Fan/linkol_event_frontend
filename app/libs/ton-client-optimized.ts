import { TonClient, Address } from 'ton';
import { ton_chain } from '@constants/chains';

// 请求缓存接口
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
}

// 请求去重Map
const pendingRequests = new Map<string, Promise<any>>();

// 缓存Map
const cache = new Map<string, CacheEntry<any>>();

// 创建优化的 TonClient 实例
export const tonClient = new TonClient({
  endpoint: ton_chain.rpcUrls.default.http[0],
});

/**
 * 带缓存的 getBalance 方法
 * @param address 地址
 * @param ttl 缓存时间（毫秒），默认30秒
 * @returns Promise<bigint>
 */
export const getCachedBalance = async (address: Address, ttl: number = 30000): Promise<bigint> => {
  const addressStr = address.toString();
  const cacheKey = `balance_${addressStr}`;

  // 检查缓存
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(`[TON Cache] Using cached balance for ${addressStr}`);
    return cached.data;
  }

  // 检查是否有正在进行的相同请求
  if (pendingRequests.has(cacheKey)) {
    console.log(`[TON Cache] Waiting for pending balance request for ${addressStr}`);
    return pendingRequests.get(cacheKey)!;
  }

  // 创建新请求
  const request = tonClient
    .getBalance(address)
    .then((balance) => {
      // 缓存结果
      cache.set(cacheKey, {
        data: balance,
        timestamp: Date.now(),
        ttl,
      });

      // 清除pending请求
      pendingRequests.delete(cacheKey);

      console.log(`[TON Cache] Cached balance for ${addressStr}: ${balance.toString()}`);
      return balance;
    })
    .catch((error) => {
      // 清除pending请求
      pendingRequests.delete(cacheKey);
      throw error;
    });

  pendingRequests.set(cacheKey, request);
  return request;
};

/**
 * 带缓存的 runMethod 方法
 * @param address 合约地址
 * @param method 方法名
 * @param params 参数
 * @param ttl 缓存时间（毫秒），默认60秒
 * @returns Promise<any>
 */
export const getCachedRunMethod = async (
  address: Address,
  method: string,
  params: any[] = [],
  ttl: number = 60000
): Promise<any> => {
  const addressStr = address.toString();
  const cacheKey = `method_${addressStr}_${method}_${JSON.stringify(params)}`;

  // 检查缓存
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    console.log(`[TON Cache] Using cached method result for ${addressStr}.${method}`);
    return cached.data;
  }

  // 检查是否有正在进行的相同请求
  if (pendingRequests.has(cacheKey)) {
    console.log(`[TON Cache] Waiting for pending method request for ${addressStr}.${method}`);
    return pendingRequests.get(cacheKey)!;
  }

  // 创建新请求
  const request = tonClient
    .runMethod(address, method, params)
    .then((result) => {
      // 验证返回结果
      if (!result) {
        throw new Error('Empty response from contract method');
      }

      // 缓存结果
      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        ttl,
      });

      // 清除pending请求
      pendingRequests.delete(cacheKey);

      console.log(`[TON Cache] Cached method result for ${addressStr}.${method}`);
      return result;
    })
    .catch((error) => {
      // 清除pending请求
      pendingRequests.delete(cacheKey);

      // 记录更详细的错误信息
      console.error(`[TON Cache] Method call failed for ${addressStr}.${method}:`, error);

      // 如果是 EOF 错误，提供更友好的错误信息
      if (error instanceof Error && error.message.includes('EOF')) {
        throw new Error(
          `Contract method '${method}' failed: Invalid response format or contract not found`
        );
      }

      throw error;
    });

  pendingRequests.set(cacheKey, request);
  return request;
};

/**
 * 清除指定地址的缓存
 * @param address 地址
 */
export const clearAddressCache = (address: Address) => {
  const addressStr = address.toString();
  const keysToDelete = Array.from(cache.keys()).filter((key) => key.includes(addressStr));

  keysToDelete.forEach((key) => cache.delete(key));
  console.log(`[TON Cache] Cleared cache for address ${addressStr}`);
};

/**
 * 清除所有缓存
 */
export const clearAllCache = () => {
  cache.clear();
  pendingRequests.clear();
  console.log('[TON Cache] Cleared all cache');
};

/**
 * 获取缓存统计信息
 */
export const getCacheStats = () => {
  const now = Date.now();
  const validEntries = Array.from(cache.entries()).filter(
    ([_, entry]) => now - entry.timestamp < entry.ttl
  );

  return {
    totalEntries: cache.size,
    validEntries: validEntries.length,
    expiredEntries: cache.size - validEntries.length,
    pendingRequests: pendingRequests.size,
  };
};

// 定期清理过期缓存
setInterval(() => {
  const now = Date.now();
  const expiredKeys = Array.from(cache.entries())
    .filter(([_, entry]) => now - entry.timestamp >= entry.ttl)
    .map(([key, _]) => key);

  expiredKeys.forEach((key) => cache.delete(key));

  if (expiredKeys.length > 0) {
    console.log(`[TON Cache] Cleaned up ${expiredKeys.length} expired entries`);
  }
}, 60000); // 每分钟清理一次
