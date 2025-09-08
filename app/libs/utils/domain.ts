/**
 * 动态获取当前域名
 * 支持客户端和服务器端
 */
export function getCurrentDomain(): string {
  // 客户端环境
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }

  // 服务器端环境 (Next.js)
  if (typeof process !== 'undefined') {
    // Vercel 部署
    if (process.env.VERCEL_URL) {
      return process.env.VERCEL_URL;
    }

    // Netlify 部署
    if (process.env.NETLIFY_URL) {
      return process.env.NETLIFY_URL;
    }

    // Railway 部署
    if (process.env.RAILWAY_STATIC_URL) {
      return process.env.RAILWAY_STATIC_URL;
    }

    // 通用环境变量
    if (process.env.NEXT_PUBLIC_DOMAIN) {
      return process.env.NEXT_PUBLIC_DOMAIN;
    }

    // 本地开发环境
    if (process.env.NODE_ENV === 'development') {
      return 'localhost:3000';
    }
  }

  // 默认域名
  return 'check.linkol.fun';
}

/**
 * 获取完整的当前URL
 */
export function getCurrentUrl(): string {
  // 客户端环境
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // 服务器端环境
  const domain = getCurrentDomain();

  // 如果域名已经包含协议，直接返回
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain;
  }

  // 本地开发环境使用 http
  if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
    return `http://${domain}`;
  }

  // 生产环境使用 https
  return `https://${domain}`;
}

/**
 * 获取当前协议 (http/https)
 */
export function getCurrentProtocol(): string {
  // 客户端环境
  if (typeof window !== 'undefined') {
    return window.location.protocol;
  }

  // 服务器端环境
  const domain = getCurrentDomain();

  if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
    return 'http:';
  }

  return 'https:';
}

/**
 * 使用示例:
 *
 * // 在组件中动态显示域名
 * import { getCurrentDomain } from '@/app/libs/utils';
 *
 * function MyComponent() {
 *   return <div>当前域名: {getCurrentDomain()}</div>;
 * }
 *
 * // 构建完整的API URL
 * import { getCurrentUrl } from '@/app/libs/utils';
 *
 * const apiUrl = `${getCurrentUrl()}/api/data`;
 *
 * // 获取协议
 * import { getCurrentProtocol } from '@/app/libs/utils';
 *
 * const protocol = getCurrentProtocol(); // "https:" 或 "http:"
 */
