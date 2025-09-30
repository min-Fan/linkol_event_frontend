'use client';
import React, { useState } from 'react';
import { Button } from '@shadcn/components/ui/button';
import { useWalletConfig } from '@hooks/useWalletConfig';
import WalletConfigModal from './WalletConfigModal';

/**
 * 钱包配置管理示例组件
 * 可以在管理界面中使用
 */
const WalletConfigExample: React.FC = () => {
  const { configs, saveConfigs, resetToDefault } = useWalletConfig();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const handleSaveConfigs = (newConfigs: any[]) => {
    saveConfigs(newConfigs);
    console.log('Wallet configs saved:', newConfigs);
  };

  const handleResetToDefault = () => {
    resetToDefault();
    console.log('Wallet configs reset to default');
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">钱包配置管理</h2>
        <div className="space-x-2">
          <Button onClick={() => setIsConfigModalOpen(true)}>配置钱包</Button>
          <Button variant="outline" onClick={handleResetToDefault}>
            重置为默认
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">当前配置:</h3>
        {configs.map((config) => (
          <div
            key={config.appName}
            className="flex items-center justify-between rounded border p-2"
          >
            <div>
              <span className="font-medium">{config.name}</span>
              <span className="ml-2 text-sm text-gray-500">({config.appName})</span>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`rounded px-2 py-1 text-xs ${
                  config.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {config.enabled ? '启用' : '禁用'}
              </span>
              <span className="text-sm text-gray-500">优先级: {config.priority}</span>
            </div>
          </div>
        ))}
      </div>

      <WalletConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={handleSaveConfigs}
      />
    </div>
  );
};

export default WalletConfigExample;
