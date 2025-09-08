'use client';
import CompPromotionDataOverview from './PromotionDataOverview';
import CompPromotionDataList from './PromotionDataList';
import { useState, useEffect } from 'react';
import { getOrderGain } from '@libs/request';
import { toast } from 'sonner';
import { IOrderGainData } from 'app/@types/types';
import { useAppSelector } from '@store/hooks';
export default function PromotionData() {
  const [isLoading, setIsLoading] = useState(false);
  const [orderGain, setOrderGain] = useState<IOrderGainData>();
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const getOrderGainData = async () => {
    try {
      setIsLoading(true);
      const res: any = await getOrderGain({
        order_id: quickOrder?.order_id,
        page: currentPage,
        size: pageSize,
      });
      setIsLoading(false);
      if (res.code === 200) {
        setOrderGain(res.data);
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quickOrder?.order_id) {
      getOrderGainData();
    }
  }, [currentPage, pageSize, quickOrder?.order_id]);

  return (
    <div className="space-y-5">
      <CompPromotionDataOverview isLoading={isLoading} orderGain={orderGain} />
      <CompPromotionDataList
        isLoading={isLoading}
        orderGain={orderGain}
        currentPage={currentPage}
        pageSize={pageSize}
        changePage={setCurrentPage}
      />
    </div>
  );
}
