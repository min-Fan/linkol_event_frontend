'use client';
import { useState, useEffect } from 'react';
import { SupportedWalletConfig, SUPPORTED_WALLETS } from '@constants/supportedWallets';

/**
 * 钱包配置管理hooks
 */
export const useWalletConfig = () => {
  const [configs, setConfigs] = useState<SupportedWalletConfig[]>([]);

  useEffect(() => {
    // 从localStorage加载配置，如果没有则使用默认配置
    const savedConfigs = localStorage.getItem('wallet-configs');
    if (savedConfigs) {
      try {
        setConfigs(JSON.parse(savedConfigs));
      } catch (error) {
        console.error('Failed to parse saved wallet configs:', error);
        setConfigs([...SUPPORTED_WALLETS]);
      }
    } else {
      setConfigs([...SUPPORTED_WALLETS]);
    }
  }, []);

  const saveConfigs = (newConfigs: SupportedWalletConfig[]) => {
    setConfigs(newConfigs);
    localStorage.setItem('wallet-configs', JSON.stringify(newConfigs));
  };

  const isWalletSupported = (appName: string): boolean => {
    return configs.some((wallet) => wallet.appName === appName && wallet.enabled);
  };

  const getWalletConfig = (appName: string): SupportedWalletConfig | undefined => {
    return configs.find((wallet) => wallet.appName === appName);
  };

  const getEnabledConfigs = (): SupportedWalletConfig[] => {
    return configs.filter((wallet) => wallet.enabled).sort((a, b) => a.priority - b.priority);
  };

  const resetToDefault = () => {
    setConfigs([...SUPPORTED_WALLETS]);
    localStorage.removeItem('wallet-configs');
  };

  return {
    configs,
    saveConfigs,
    isWalletSupported,
    getWalletConfig,
    getEnabledConfigs,
    resetToDefault,
  };
};
