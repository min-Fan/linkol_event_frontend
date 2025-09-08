'use client';
import React, { useRef, useState, useEffect } from 'react';
import PostContent from './post-content';
import PostView from './post-view';
import { IKol, IKolOrderDetail, OrderPreviewType } from 'app/@types/types';
import { useOrderPreview } from 'app/context/OrderPreviewContext';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import OrderPreviewProfile from './order-previewProfile';
import { useAccount } from 'wagmi';
import EvmConnect from 'app/components/evm-connect';
import { CardContent, Card } from '@shadcn/components/ui/card';
import TweetView from './tweet-view';

export default function OrderPreview({
  kol,
  orderDetail,
}: {
  kol: IKol;
  orderDetail: IKolOrderDetail;
}) {
  const { address } = useAccount();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const mouseLeaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { status, setStatus } = useOrderPreview();

  // useEffect(() => {
  //   if (status === undefined || status === null) {
  //     if (orderDetail.kol_audit_status === 'pending' || orderDetail.kol_audit_status === 'doing' || orderDetail.kol_audit_status === 'received') {
  //       setStatus(OrderPreviewType.POST_CONTENT);
  //     } else if (orderDetail.kol_audit_status === 'done' || orderDetail.kol_audit_status === 'executed') {
  //       setStatus(OrderPreviewType.POST_NONE);
  //     } else {
  //       setStatus(OrderPreviewType.POST_VIEW);
  //     }
  //   }
  // }, [orderDetail, status]);

  const handleMouseEnter = () => {
    setShouldAutoScroll(false);

    if (mouseLeaveTimerRef.current) {
      clearTimeout(mouseLeaveTimerRef.current);
      mouseLeaveTimerRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (mouseLeaveTimerRef.current) {
      clearTimeout(mouseLeaveTimerRef.current);
    }

    mouseLeaveTimerRef.current = setTimeout(() => {
      setShouldAutoScroll(true);
      scrollToBottom();
      mouseLeaveTimerRef.current = null;
    }, 500);
  };
  const scrollToBottom = () => {
    if (shouldAutoScroll && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };
  return (
    <Card className="h-full w-full overflow-hidden py-0">
      <CardContent className="flex h-full w-full flex-col px-0">
        <OrderPreviewProfile info={kol} />
        <div
          className="box-border w-full flex-1 overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ScrollArea className="box-border h-full w-full p-2" ref={scrollAreaRef}>
            {status === OrderPreviewType.POST_CONTENT && (
              <div className="h-full w-full">
                <PostContent orderDetail={orderDetail} />
              </div>
            )}
            {status === OrderPreviewType.POST_VIEW && (
              // {address && ()}
              <div className="h-full w-full">
                <PostView orderDetail={orderDetail} />
              </div>
            )}
            {status === OrderPreviewType.POST_NONE && (
              // {address && ()}
              <div className="h-full w-full">
                <TweetView kol={orderDetail.kol} />
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
