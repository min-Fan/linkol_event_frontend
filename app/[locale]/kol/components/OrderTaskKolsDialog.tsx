import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent } from '@shadcn/components/ui/dialog';
import { Button } from '@shadcn/components/ui/button';
import defaultAvatar from '@assets/image/avatar.png';
import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import CountdownTimer from 'app/components/CountdownTimer';
import {
  getKolTakeOrderList,
  IGetKolTakeOrderListResponse,
  ITakeOrderListKol,
} from '@libs/request';
import { Loader2 } from 'lucide-react';
import { add, parse } from 'date-fns';

interface OrderTaskKolsDialogProps {
  children: React.ReactNode;
  orderId: string;
  created_at: string;
  action_type: string;
}

export default function OrderTaskKolsDialog({
  children,
  orderId,
  created_at,
  action_type,
}: OrderTaskKolsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<IGetKolTakeOrderListResponse | null>(null);
  const startTime = new Date(created_at).getTime() || 0;
  const endTime = add(parse(created_at, 'yyyy-MM-dd HH:mm:ss', new Date()), {
    hours: 24,
  }).getTime();
  // 获取订单KOL列表数据
  const fetchOrderData = async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      const res: any = await getKolTakeOrderList({ order_id: orderId });
      if (res.code === 200) {
        setOrderData(res.data);
      }
    } catch (error) {
      console.error('获取订单KOL列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 当弹窗打开并且有orderId时获取数据
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderData();
    }
  }, [isOpen, orderId]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[500px] max-w-[90vw]">
        <div className="mb-6 w-full">
          <h1 className="text-center text-base font-bold">Task progress detail</h1>
        </div>
        <div className="border-border flex w-full flex-col border-b pb-4">
          <div className="text-md flex items-center">
            <span>Total: ${orderData?.total || 0}</span>
          </div>
          <div className="text-md flex items-center">
            <span>Remaining balance:</span>
            <span className="font-bold">${orderData?.remain_balance || 0}</span>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ScrollArea className="flex max-h-[300px] flex-col gap-1">
            {orderData?.kols && orderData.kols.length > 0 ? (
              orderData.kols.map((kol, index) => (
                <div className="mb-2 grid grid-cols-12 gap-2" key={kol.id || index}>
                  <div className="col-span-4 flex items-center gap-2">
                    <img
                      src={kol.profile_image_url || defaultAvatar.src}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = defaultAvatar.src;
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="w-20 truncate text-base font-medium">{kol.name}</span>
                      <span className="w-20 truncate text-sm">@{kol.screen_name}</span>
                    </div>
                  </div>
                  <div className="col-span-4 flex items-center justify-center">
                    <span className="text-base font-medium">${kol.price}</span>
                    <span className="text-muted-foreground/60 text-sm">/tweet</span>
                  </div>
                  <div className="col-span-4 flex items-center justify-end gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <Button variant="secondary">
                        <span>{kol.status}</span>
                      </Button>
                      {kol.status == 'Awaiting' && action_type !== 'expired' && (
                        <CountdownTimer
                          startTime={startTime}
                          endTime={endTime}
                          onEnd={() => {}}
                          className="text-muted-foreground/80"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-10">
                <span>No KOL data available</span>
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
