import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from '@libs/i18n/routing';
import { CACHE_KEY } from '@constants/app';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 处理邀请码路由: /[locale]/[inviteCode] 或 /[locale]/[inviteCode]/*
  // 邀请码格式：6位大写字母和数字的组合
  const inviteCodeMatch = pathname.match(/^\/([a-z]{2})\/([A-Z0-9]{6})(?:\/(.*))?$/);
  
  if (inviteCodeMatch) {
    const [, locale, inviteCode, restPath] = inviteCodeMatch;
    
    // 构建重定向URL
    // 如果没有restPath，重定向到首页；否则重定向到对应的路径
    const targetPath = restPath ? `/${locale}/${restPath}` : `/${locale}`;
    const url = new URL(targetPath, request.url);
    url.search = request.nextUrl.search;
    
    // 创建响应并设置cookie
    const response = NextResponse.redirect(url);
    
    // 将邀请码存储在cookie中，有效期30天
    response.cookies.set(CACHE_KEY.INVITE_CODE, inviteCode, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'lax',
    });
    
    return response;
  }

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
