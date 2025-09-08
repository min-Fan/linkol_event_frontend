'use client';

import { useApp } from '@store/AppProvider';

import { ORDER_PROGRESS } from '@constants/app';
import CompKOLSquare from './KOLSquare';
import CompSubmitOrder from './SubmitOrder';
import CompCreateProduct from './CreateProduct';
import CompKOLPromotion from './KOLPromotion';
import CompPromotionData from './PromotionData';

export default function Scenes() {
  const { state } = useApp();
  const { orderProgress } = state;

  return (
    <>
      {orderProgress === ORDER_PROGRESS.KOL_SQUARE && <CompKOLSquare />}
      {orderProgress === ORDER_PROGRESS.SUBMIT_ORDER && <CompSubmitOrder />}
      {orderProgress === ORDER_PROGRESS.KOL_PROMOTION && <CompKOLPromotion />}
      {orderProgress === ORDER_PROGRESS.PROMOTION_DATA && <CompPromotionData />}
    </>
  );
}
