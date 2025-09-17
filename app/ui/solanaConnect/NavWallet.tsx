'use client';
import { useAnchorProvider } from '../../solana/solana-provider';
import { formatSol } from '../../libs/utils/format-bignumber';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../store/hooks';
import UAddr from './UFormatAddr';
import useLogout from './useLogin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shadcn/components/ui/dropdown-menu';
import { Menu } from 'lucide-react';
import { SolIcon } from '@assets/svg';

const NavWalletStyled = styled.div``;

export default function NavWallet() {
  const { publicKey, wallet, disconnect } = useWallet();
  const { connection } = useAnchorProvider();
  const [bal, setBal] = useState('');
  const getBalance = async () => {
    try {
      if (!publicKey) return;
      const balance = await connection.getBalance(publicKey);
      setBal(formatSol({ balance }).toLocaleString());
    } catch (error) {
      console.log('balance error ==>', error);
    }
  };
  const rpc = useAppSelector((state) => state.userReducer?.rpc);

  const { disConnect } = useLogout();
  useEffect(() => {
    getBalance();
  }, [publicKey, rpc]);
  return (
    <>
      <NavWalletStyled className="text-md flex h-full cursor-pointer items-center justify-center gap-3">
        {bal && (
          <div className="balance-box flex items-center gap-1">
            <span>{bal}</span>
            <SolIcon className="h-3 w-3" />
          </div>
        )}
        <div className="wallet-box flex items-center gap-2 text-sm">
          <img src={wallet?.adapter.icon} alt="" className="h-4 w-4 object-cover" />
          <UAddr address={publicKey?.toString() as string}></UAddr>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <NavWalletStyled className="text-md flex h-full cursor-pointer items-center justify-center gap-3">
              <div className="icon-box cursor-pointer">
                <Menu />
              </div>
            </NavWalletStyled>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="p-0">
              <div className="text-md w-full text-right">
                <p className="rounded-xs p-1 hover:bg-white/10" onClick={() => disConnect()}>
                  Disconnect
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </NavWalletStyled>
    </>
  );
}
