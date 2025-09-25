import { TonClient } from 'ton';
import { ton_chain } from '@constants/chains';

// 创建共享的 TonClient 实例，避免重复创建
export const tonClient = new TonClient({
  endpoint: ton_chain.rpcUrls.default.http[0]
});
