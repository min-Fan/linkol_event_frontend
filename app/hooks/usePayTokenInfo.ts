import { getContractAddress } from '@constants/config';
import { useAppDispatch } from '@store/hooks';
import { updatePayTokenInfo } from '@store/reducers/userSlice';
import { erc20Abi } from 'viem';
import { useReadContract, useAccount } from 'wagmi';

export const usePayTokenInfo = () => {
  const dispatch = useAppDispatch();
  const { address } = useAccount();
  const { refetch: refetchDecimals } = useReadContract({
    address: getContractAddress().pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'decimals',
  });
  const { refetch: refetchSymbol } = useReadContract({
    address: getContractAddress().pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'symbol',
  });
  const { refetch: refetchBalance } = useReadContract({
    address: getContractAddress().pay_member_token_address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
  });

  const getPayTokenInfo = async () => {
    try {
      const [decimals, symbol, balance] = await Promise.all([
        refetchDecimals(),
        refetchSymbol(),
        refetchBalance(),
      ]);
      dispatch(
        updatePayTokenInfo({
          symbol: symbol.data as string,
          decimals: decimals.data as number,
          balance: balance.data as bigint,
          iconType: symbol.data?.toLowerCase() as string,
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  return { getPayTokenInfo };
};
