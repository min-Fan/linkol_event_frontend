'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/components/ui/dialog';
import { Button } from '@shadcn/components/ui/button';
import { Switch } from '@shadcn/components/ui/switch';
import { Input } from '@shadcn/components/ui/input';
import { Label } from '@shadcn/components/ui/label';
import { useTranslations } from 'next-intl';
import { SUPPORTED_WALLETS, SupportedWalletConfig } from '@constants/supportedWallets';

interface WalletConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (configs: SupportedWalletConfig[]) => void;
}

const WalletConfigModal: React.FC<WalletConfigModalProps> = ({ isOpen, onClose, onSave }) => {
  const t = useTranslations('common');
  const [configs, setConfigs] = useState<SupportedWalletConfig[]>([]);

  useEffect(() => {
    if (isOpen) {
      setConfigs([...SUPPORTED_WALLETS]);
    }
  }, [isOpen]);

  const handleToggleEnabled = (index: number) => {
    const newConfigs = [...configs];
    newConfigs[index].enabled = !newConfigs[index].enabled;
    setConfigs(newConfigs);
  };

  const handlePriorityChange = (index: number, priority: number) => {
    const newConfigs = [...configs];
    newConfigs[index].priority = Math.max(1, Math.min(10, priority));
    setConfigs(newConfigs);
  };

  const handleSave = () => {
    onSave(configs);
    onClose();
  };

  const sortedConfigs = [...configs].sort((a, b) => a.priority - b.priority);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>钱包配置管理</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="mb-4 text-sm text-gray-600">
            配置系统支持的钱包列表，可以启用/禁用钱包并设置显示优先级
          </div>

          {sortedConfigs.map((config, index) => (
            <div key={config.appName} className="flex items-center space-x-4 rounded-lg border p-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{config.name}</h3>
                  <span className="text-xs text-gray-500">({config.appName})</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`enabled-${config.appName}`}>启用</Label>
                  <Switch
                    id={`enabled-${config.appName}`}
                    checked={config.enabled}
                    onCheckedChange={() =>
                      handleToggleEnabled(configs.findIndex((c) => c.appName === config.appName))
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor={`priority-${config.appName}`}>优先级</Label>
                  <Input
                    id={`priority-${config.appName}`}
                    type="number"
                    min="1"
                    max="10"
                    value={config.priority}
                    onChange={(e) =>
                      handlePriorityChange(
                        configs.findIndex((c) => c.appName === config.appName),
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-20"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>保存配置</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConfigModal;
