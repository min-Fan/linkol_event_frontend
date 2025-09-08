import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@libs/i18n/routing';

// const intlMiddleware = createMiddleware(routing);

// export default function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // 只允许访问根目录页面 (/, /zh, /en)
//   const allowedPaths = ['/', '/zh', '/en', '/en/not-found'];

//   if (!allowedPaths.includes(pathname)) {
//     // 其他页面都跳转到404
//     return NextResponse.redirect(new URL('/en/not-found', request.url));
//   }

//   // 对于允许的路径，使用国际化中间件
//   return intlMiddleware(request);
// }
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
