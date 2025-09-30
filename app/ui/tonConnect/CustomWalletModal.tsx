'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Button } from '@shadcn/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { cn } from '@shadcn/lib/utils';
import { WalletInfo } from '@tonconnect/ui-react';
import { useWalletConfig } from '@hooks/useWalletConfig';

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  onCloseAllDialogs?: () => void;
}

const CustomWalletModal: React.FC<CustomWalletModalProps> = ({ isOpen, onClose, onConnect, onCloseAllDialogs }) => {
  const t = useTranslations('common');
  const [tonConnectUI] = useTonConnectUI();
  const { isWalletSupported, getWalletConfig } = useWalletConfig();
  const [isConnecting, setIsConnecting] = useState(false);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 获取已安装的钱包列表
  useEffect(() => {
    const fetchInstalledWallets = async () => {
      if (!tonConnectUI) return;

      try {
        setIsLoadingWallets(true);
        const walletList = await tonConnectUI.getWallets();
        console.log('All wallets:', walletList);

        // 检测设备类型
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

        // 过滤出支持的钱包（不管是否已安装）
        const supportedWallets = walletList.filter((wallet) => {
          // 首先检查钱包是否被支持
          if (!isWalletSupported(wallet.appName)) {
            return false;
          }

          // 显示所有支持的钱包，不管是否已安装
          return true;
        });

        // 按优先级排序
        const sortedWallets = supportedWallets.sort((a, b) => {
          const configA = getWalletConfig(a.appName);
          const configB = getWalletConfig(b.appName);
          const priorityA = configA?.priority || 999;
          const priorityB = configB?.priority || 999;
          return priorityA - priorityB;
        });

        console.log('Supported wallets:', sortedWallets);
        setWallets(sortedWallets);
      } catch (error) {
        console.error('Failed to fetch wallets:', error);
        setConnectionError('Failed to fetch wallets');
      } finally {
        setIsLoadingWallets(false);
      }
    };

    if (isOpen) {
      fetchInstalledWallets();
    }
  }, [tonConnectUI, isOpen]);

  // 当弹窗关闭时重置状态
  useEffect(() => {
    if (!isOpen) {
      // 清理连接状态
      setIsConnecting(false);
      setConnectionError(null);
      setConnectingWallet(null);

      // 清理超时定时器
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      // 清理事件监听器
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }
  }, [isOpen]);

  const handleWalletConnect = async (wallet: WalletInfo) => {
    try {
      setIsConnecting(true);
      setConnectingWallet(wallet.appName);
      setConnectionError(null);

      console.log('Opening wallet modal:', wallet.appName);

      // 先关闭所有弹窗（包括claim弹窗）
      if (onCloseAllDialogs) {
        onCloseAllDialogs();
      } else {
        // 如果没有提供关闭所有弹窗的回调，只关闭当前弹窗
        onClose();
      }

      // 等待一小段时间确保弹窗完全关闭
      await new Promise(resolve => setTimeout(resolve, 100));

      // 打开指定钱包的专用模态框
      await tonConnectUI.openSingleWalletModal(wallet.appName);

      // 监听连接状态变化
      const unsubscribe = tonConnectUI.onStatusChange((connectedWallet) => {
        if (connectedWallet) {
          console.log('Wallet connected:', connectedWallet);
          setIsConnecting(false);
          setConnectingWallet(null);
          // 不需要再次调用onClose，因为已经在上面关闭了
          onConnect();
          unsubscribe();
        }
      });

      // 保存unsubscribe函数到ref
      unsubscribeRef.current = unsubscribe;

      // 设置超时，如果2分钟内没有连接则重置状态
      const timeoutId = setTimeout(() => {
        setIsConnecting(false);
        setConnectingWallet(null);
        setConnectionError('connect timeout, please try again');
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }, 120000); // 2分钟超时

      // 保存超时ID到ref
      connectionTimeoutRef.current = timeoutId;
    } catch (error) {
      console.error('connect wallet error:', error);
      setIsConnecting(false);
      setConnectingWallet(null);
      setConnectionError(`connect failed, please ensure ${wallet.name} wallet is installed`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-96 max-w-full overflow-hidden rounded-2xl sm:w-[450px] sm:max-w-full sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center">{t('connect_wallet')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {isLoadingWallets ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground text-sm">{t('loading_installed_wallets')}</p>
              </div>
            </div>
          ) : wallets.length > 0 ? (
            /* 钱包列表 */
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {wallets.map((wallet) => (
                <div
                  key={wallet.appName}
                  className="border-border relative flex items-center justify-between gap-6 overflow-hidden rounded-lg border p-4 pt-6 transition-colors hover:bg-gray-50"
                >
                  {(() => {
                    const config = getWalletConfig(wallet.appName);
                    return config && config.priority <= 3 ? (
                      <span className="bg-primary/10 text-primary absolute top-0 right-0 rounded-bl-2xl px-2 py-1 text-xs">
                        {t('recommended')}
                      </span>
                    ) : null;
                  })()}
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full">
                      {wallet.imageUrl ? (
                        <img
                          src={wallet.imageUrl}
                          alt={wallet.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="from-primary flex h-full w-full items-center justify-center bg-gradient-to-br to-purple-600">
                          <span className="text-lg font-bold text-white">
                            {wallet.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{wallet.name}</h3>
                        {'injected' in wallet ? (
                          wallet.injected ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                              {t('installed')}
                            </span>
                          ) : (
                            <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-xs">
                              {t('not_installed')}
                            </span>
                          )
                        ) : (
                          <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">
                            {t('mobile')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {wallet.aboutUrl ? (
                          <div className="flex items-center space-x-2">
                            <a
                              href={wallet.aboutUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {wallet.name}
                            </a>
                          </div>
                        ) : (
                          <div>{`${wallet.name}`}</div>
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleWalletConnect(wallet)}
                    disabled={isConnecting}
                    className={cn('px-6 py-2', isConnecting && 'cursor-not-allowed opacity-50')}
                  >
                    {isConnecting && connectingWallet === wallet.appName
                      ? t('connecting')
                      : t('connect')}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="mb-4 text-gray-500">{t('no_wallets_found')}</p>
              <p className="text-sm text-gray-400">{t('install_wallet_app')}</p>
            </div>
          )}

          {/* 错误信息 */}
          {connectionError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-center text-sm text-red-600">{connectionError}</p>
            </div>
          )}

          {/* 说明文字 */}
          <div className="text-muted-foreground text-center text-sm">
            <p>{t('wallet_connect_description')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomWalletModal;
