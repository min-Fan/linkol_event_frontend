import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@libs/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 处理 /market_events/ 路由重定向到 /m/
  // 匹配模式: /[locale]/market_events/ 或 /market_events/
  if (pathname.match(/^\/[a-z]{2}\/market_events\//) || pathname.match(/^\/market_events\//)) {
    const newPath = pathname.replace(/\/market_events\//, '/m/');
    const url = new URL(newPath, request.url);
    // 保持查询参数
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  // 使用国际化中间件处理其他路由
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
