import { useEffect, useState } from 'react';
import { getInviteCodeFromCookie } from '@libs/utils/inviteCode';

/**
 * Hook to get and track invite code from cookie
 * @returns The invite code from cookie, or null if not found
 */
export function useInviteCode(): string | null {
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const code = getInviteCodeFromCookie();
    setInviteCode(code);
  }, []);

  return inviteCode;
}
