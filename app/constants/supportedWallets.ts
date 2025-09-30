/**
 * 支持的钱包配置
 * 可以在这里配置系统支持的钱包列表
 */

export interface SupportedWalletConfig {
  appName: string;
  name: string;
  priority: number; // 优先级，数字越小优先级越高
  enabled: boolean; // 是否启用
}

// 支持的钱包列表配置
export const SUPPORTED_WALLETS: SupportedWalletConfig[] = [
  {
    appName: "telegram-wallet",
    name: "Wallet",
    priority: 1,
    enabled: true,
  },
  {
    appName: 'tonkeeper',
    name: 'Tonkeeper',
    priority: 2,
    enabled: true,
  },
  {
    appName: 'mytonwallet',
    name: 'MyTonWallet',
    priority: 3,
    enabled: false,
  }

];

/**
 * 获取启用的支持钱包列表
 */
export const getEnabledSupportedWallets = (): SupportedWalletConfig[] => {
  return SUPPORTED_WALLETS
    .filter(wallet => wallet.enabled)
    .sort((a, b) => a.priority - b.priority);
};

/**
 * 检查钱包是否被支持
 */
export const isWalletSupported = (appName: string): boolean => {
  return SUPPORTED_WALLETS.some(wallet => 
    wallet.appName === appName && wallet.enabled
  );
};

/**
 * 获取钱包的配置信息
 */
export const getWalletConfig = (appName: string): SupportedWalletConfig | undefined => {
  return SUPPORTED_WALLETS.find(wallet => wallet.appName === appName);
};
