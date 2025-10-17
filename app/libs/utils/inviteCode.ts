import { CACHE_KEY } from '@constants/app';
/**
 * 从cookie中获取邀请码
 */
export function getInviteCodeFromCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const inviteCodeCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${CACHE_KEY.INVITE_CODE}=`)
  );

  if (inviteCodeCookie) {
    return inviteCodeCookie.split('=')[1].trim();
  }

  return null;
}

/**
 * 设置邀请码到cookie
 */
export function setInviteCodeToCookie(inviteCode: string): void {
  if (typeof document === 'undefined') return;

  const maxAge = 30 * 24 * 60 * 60; // 30 days
  document.cookie = `${CACHE_KEY.INVITE_CODE}=${inviteCode}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * 清除邀请码cookie
 */
export function clearInviteCodeCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${CACHE_KEY.INVITE_CODE}=; max-age=0; path=/`;
}
