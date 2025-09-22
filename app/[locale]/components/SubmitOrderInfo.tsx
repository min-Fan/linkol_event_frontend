import { useTranslations } from 'next-intl';

import { Base } from '@assets/svg';
import { DEFAULT_CHAIN } from '@constants/chains';
import { formatBigNumber } from '@libs/utils/format-bignumber';
import { getContractAddress } from '@constants/config';

export default function SubmitOrderInfo(props: {
  amount: string;
  symbol?: string;
  address?: `0x${string}`;
  balance?: bigint;
  decimals?: number;
}) {
  const { amount, symbol = '', address = '', balance = BigInt(0), decimals = '6' } = props;
  const t = useTranslations('common');
  const contractAddress = getContractAddress();
  return (
    <div className="bg-background w-full rounded-2xl px-4 py-2 shadow-sm">
      <dl className="border-border flex w-full items-center justify-between gap-x-2 border-b p-2">
        <dt>{t('receive_contract_address')}</dt>
        <dd className="break-all">{contractAddress?.KOLServiceAddress || '-'}</dd>
      </dl>
      <dl className="border-border flex w-full items-center justify-between gap-x-2 border-b p-2">
        <dt>{t('network')}</dt>
        <dd className="flex items-center gap-x-1">
          {(DEFAULT_CHAIN.id === 8453 || DEFAULT_CHAIN.id === 84532) && (
            <Base className="size-4 rounded-full" />
          )}
          {DEFAULT_CHAIN.id === 32383 && (
            <img src={DEFAULT_CHAIN.iconUrl as string} alt="agent_chain" width={16} height={16} />
          )}
          <span>{DEFAULT_CHAIN.name}</span>
        </dd>
      </dl>
      <dl className="border-border flex w-full items-center justify-between gap-x-2 border-b p-2">
        <dt>{t('payment_amount')}</dt>
        <dd>
          {amount} {symbol || ''} (ERC20)
        </dd>
      </dl>
      <dl className="border-border flex w-full items-center justify-between gap-x-2 border-b p-2">
        <dt>{t('wallet_address')}</dt>
        <dd className="break-all">{address}</dd>
      </dl>
      <dl className="flex w-full items-center justify-between gap-x-2 p-2">
        <dt>{t('wallet_balance')}</dt>
        <dd>
          {formatBigNumber(balance || BigInt(0), Number(decimals))} {symbol || ''}
        </dd>
      </dl>
    </div>
  );
}
