import { getTokenConfigByEventInfo, getChainConfig, TokenConfig } from '@constants/config';
import { IEventInfoResponseData } from '@libs/request';
import { usePayTokenInfo } from './usePayTokenInfo';

/**
 * 根据活动信息获取对应的token信息
 */
export const useEventTokenInfo = (eventInfo?: IEventInfoResponseData) => {
  // 获取活动的链类型和token类型
  const eventChainType = eventInfo?.chain_type?.toLowerCase() || 'base';
  const eventTokenType = eventInfo?.token_type?.toLowerCase();
  const { tokenInfo: payTokenInfo } = usePayTokenInfo(eventChainType, eventTokenType);

  // 根据活动信息获取token配置
  const tokenConfig = getTokenConfigByEventInfo(eventInfo);

  // 从store中获取对应链和token的信息
  const storeKey = eventTokenType ? `${eventChainType}_${eventTokenType}` : eventChainType;
  const storedTokenInfo = payTokenInfo?.[storeKey];

  // 获取链配置
  const chainConfig = getChainConfig(eventChainType as any);

  // 返回当前链和token的信息
  const tokenInfo: TokenConfig = storedTokenInfo || tokenConfig;

  return {
    tokenInfo,
    chainType: eventChainType,
    tokenType: eventTokenType,
    chainConfig,
    symbol: tokenInfo.symbol,
    decimals: tokenInfo.decimals,
    balance: storedTokenInfo?.balance || BigInt(0),
    iconType: tokenInfo.iconType,
    contractAddress: tokenInfo.contractAddress,
    mintAddress: tokenInfo.mintAddress,
  };
};
