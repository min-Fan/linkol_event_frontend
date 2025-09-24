import { useState, useEffect, useCallback } from 'react';
import { getUserIsAcceptedAgent } from '@libs/request';

export default function useAgentStatus() {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAgentStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await getUserIsAcceptedAgent();
      
      if (res.code === 200) {
        setIsAccepted(res.data.is_accept);
      } else {
        setError(res.message || 'Failed to check agent status');
        setIsAccepted(false);
      }
    } catch (err) {
      console.error('Failed to check agent status:', err);
      setError('Failed to check agent status');
      setIsAccepted(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAgentStatus();
  }, [checkAgentStatus]);

  return {
    isAccepted,
    isLoading,
    error,
    refetch: checkAgentStatus,
  };
}
