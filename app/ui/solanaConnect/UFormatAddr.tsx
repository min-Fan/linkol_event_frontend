'use client';
import { cn } from '../../shadcn/lib/utils';
import { formatAddress } from '../../libs/utils';
import { useState } from 'react';
import styled from 'styled-components';

const UAddrStyled = styled.div``;

export default function UAddr({
  address,
  s,
  e,
  className,
}: {
  address: string;
  s?: number;
  e?: number;
  className?: string;
}) {

  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 500); // 2秒后重置复制状态
    });
  };

  return (
    <UAddrStyled className={cn("flex items-center cursor-pointer", className)}>
      {!copied ? (
        <span className='text-sm' onClick={handleCopy}>{formatAddress(address, s, e)}</span>
      ) : (
        <span className='text-sm ml-2'>
          Copied!
        </span>
      )}
    </UAddrStyled>
  );
}
