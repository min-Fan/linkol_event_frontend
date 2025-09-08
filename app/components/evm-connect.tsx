/* This code snippet is a TypeScript React component that generates an SVG pattern based on a given
address string. Here's a breakdown of what it does: */
'use client';
import { AvatarComponent, ConnectButton, useAccountModal } from '@rainbow-me/rainbowkit';
import React, { useEffect, useState, useRef } from 'react';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { SUPPORTED_CHAIN_IDS } from '../constants/chains';
import AddressAvatar from './address-avatar';
import { updateChain, updateIsLoggedIn } from '../store/reducers/userSlice';
import { generateColorFromAddress } from '@libs/utils/avatar';
import { Button } from '@shadcn/components/ui/button';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';
import { bindWallet, getNonce } from '@libs/request';
import { toast } from 'sonner';
interface ConnectButProps {
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}

// 自定义按钮
const ConnectBut: React.FC<ConnectButProps> = ({ onClick, className, children }) => {
  return (
    <div onClick={onClick} className={className}>
      {children}
    </div>
  );
};

// 自定义头像
const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  const color = generateColorFromAddress(address);
  return ensImage ? (
    <img src={ensImage} width={size} height={size} style={{ borderRadius: 999 }} />
  ) : (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        backgroundColor: color,
        borderRadius: 999,
        height: size,
        width: size,
      }}
    >
      <AddressAvatar address={address} />
    </div>
  );
};

// 自定义连接按钮
export default function EvmConnect() {
  const dispatch = useAppDispatch();
  const { disconnect } = useDisconnect();
  const t = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);

  // 存储当前使用的 nonce
  const [currentNonce, setCurrentNonce] = useState('');

  // 使用 wagmi 的 useSignMessage hook
  const { signMessage, isPending } = useSignMessage({
    mutation: {
      onSuccess: (data) => {
        // 可以将签名保存起来，用于后续验证
        console.log('签名结果:', data);

        // 在签名成功后立即处理钱包绑定
        handleBindWallet(data, currentNonce);

        return data;
      },
      onError: (error) => {
        console.error('签名失败:', error);
        setIsLoading(false);
        return null;
      },
    },
  });

  // 使用 useAccount 来监听钱包连接状态
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isConnected && address && isLoggedIn && !token) {
      // 钱包已连接但未登录，自动开始消息签名流程
      handleSignMessage();
    }
    if (!isConnected || !isLoggedIn) {
      localStorage.removeItem('token');
      // 清除cookie
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
      // dispatch(updateIsLoggedIn(false));
    }
  }, [isConnected, isLoggedIn]);

  // 处理钱包绑定的函数
  const handleBindWallet = async (signature: string, nonce: string) => {
    try {
      // 绑定钱包地址
      const res: any = await bindWallet({ wallet: address as string, nonce: nonce, signature });
      setIsLoading(false);
      if (res && res.code === 200) {
        // 签名成功后，更新登录状态
        // dispatch(updateIsLoggedIn(true));
        localStorage.setItem('token', res.data.token);
      } else {
        console.error('绑定钱包地址失败:', res);
        toast.error(res?.msg);
      }
    } catch (error) {
      console.error('API请求错误:', error);
      setIsLoading(false);
    }
  };

  // 处理签名按钮点击
  const handleSignMessage = async () => {
    try {
      setIsLoading(true);
      // 构建签名消息，包含时间戳防止重放攻击
      // const nonce = nanoid();
      // const message = nonce;

      // 获取nonce
      const nonceRes: any = await getNonce({ wallet: address as string });
      if (nonceRes && nonceRes.code === 200) {
        const nonce = nonceRes.data.nonce;
        const message = nonce;
        console.log('message', message);
        // 保存 nonce 到状态中
        setCurrentNonce(nonce);

        // 请求签名 - onSuccess 会在签名完成后被调用
        signMessage({ message });
      } else {
        toast.error(nonceRes?.msg);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('签名失败:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full">
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
          useEffect(() => {
            if (chain) {
              // 检查是否是支持的链
              if (!SUPPORTED_CHAIN_IDS.includes(chain.id as any)) {
                // 如果不是支持的链，断开连接
                // 使用 setTimeout 来避免状态更新循环
                setTimeout(() => {
                  disconnect();
                }, 0);
                return;
              }
              // 更新当前链ID
              dispatch(updateChain(chain.id));
            }
          }, [chain, dispatch, disconnect]);

          return (
            <div className="mx-auto w-full">
              {!mounted || !account ? (
                <ConnectBut onClick={openConnectModal} className="">
                  <Button className="w-full bg-[#59C9A0] font-bold">
                    {t('btn_connect_wallet')}
                  </Button>
                </ConnectBut>
              ) : !isLoggedIn ? (
                <Button
                  className="w-full bg-[#59C9A0] font-bold"
                  onClick={() => handleSignMessage()}
                  disabled={isPending || isLoading}
                >
                  {isPending || isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    t('btn_msg_sign')
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {chain && (
                    <div
                      onClick={openChainModal}
                      className="bg-muted font-gt flex cursor-pointer items-center gap-[14px] rounded-[20px] p-[3px] pr-[10px] text-[12px] shadow-sm sm:pr-[3px]"
                    >
                      <img src={chain.iconUrl} alt="" className="h-[24px] w-[24px] rounded-full" />
                      <span className="w-full text-[12px] sm:hidden">{chain.name}</span>
                    </div>
                  )}
                  <div
                    onClick={openAccountModal}
                    className="bg-muted font-gt flex w-full cursor-pointer items-center gap-[14px] rounded-[20px] p-[3px] pr-[10px] text-[12px] shadow-sm"
                  >
                    <CustomAvatar
                      address={account.address}
                      ensImage={account.ensAvatar}
                      size={24}
                    />

                    <span className="w-full"> {account.displayName}</span>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
