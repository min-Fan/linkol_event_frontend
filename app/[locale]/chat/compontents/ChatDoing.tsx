import { AI } from '@assets/svg';
import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { LoadingDots } from './Chat';
import OrderDoing, { OrderDoingRef } from './doing/order/OrderDoing';
import { CornerRightDown } from 'lucide-react';

interface ChatDoingProps {
  data: {
    function_name: string;
    parameters: {
      has: string[];
      kol_ids: Array<{
        id: number;
        price: number;
      }>;
      miss: string[];
    };
  };
  actionId: string; // 每个action的唯一ID
  messages: any[]; // 当前消息列表
}

// 定义 ChatDoing 的 ref 接口
export interface ChatDoingRef {
  handleStepError: (error: any, stepName: string, errorMessage?: string) => Promise<void>;
}

const ChatDoing = forwardRef<ChatDoingRef, ChatDoingProps>(({ data, actionId, messages }, ref) => {
  const orderDoingRef = useRef<OrderDoingRef>(null);

  // 暴露方法给父组件 Chat
  useImperativeHandle(
    ref,
    () => ({
      handleStepError: async (error: any, stepName: string, errorMessage?: string) => {
        // 调用子组件的 handleStepError 方法
        if (orderDoingRef.current) {
          await orderDoingRef.current.handleStepError(error, stepName, errorMessage);
        }
      },
    }),
    []
  );

  // 默认的doing组件
  return (
    <div className="flex flex-col p-2">
      {/* <div className="mb-1 flex flex-row items-center gap-1">
        <div className="text-md box-border inline-block">
          <LoadingDots />
        </div>
        <CornerRightDown className="text-primary/80 size-4" />
      </div> */}
      {/* 根据function_name渲染不同的组件 */}
      {data?.function_name === 'project_order' && (
        <OrderDoing ref={orderDoingRef} data={data} actionId={actionId} messages={messages} />
      )}
    </div>
  );
});

ChatDoing.displayName = 'ChatDoing';

export default ChatDoing;
