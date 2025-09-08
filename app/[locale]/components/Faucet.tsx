'use client';

import { useState } from 'react';
import { Droplet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUdtToken } from '@libs/request';
import { useAccount } from 'wagmi';
import useUserInfo from '@hooks/useUserInfo';
import { useTranslations } from 'next-intl';

export default function Faucet() {
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const { isLogin } = useUserInfo();
  const t = useTranslations('common');
  const handleClick = async () => {
    try {
      if (!isLogin || !address) return;
      setIsLoading(true);
      const res: any = await getUdtToken({ wallet_address: address });
      if (res.code === 200) {
        toast.success(t('faucet_success'));
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      {isLogin && (
        <>
          {isLoading ? (
            <Loader2 className="text-primary hover:text-primary/80 mr-4 ml-auto size-6 animate-spin p-1" />
          ) : (
            <Droplet
              className="text-primary hover:text-primary/80 mr-4 ml-auto size-6 cursor-pointer rounded-md p-1 hover:bg-gray-100"
              onClick={handleClick}
            />
          )}
        </>
      )}
    </>
  );
}
