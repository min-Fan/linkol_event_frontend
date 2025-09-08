'use client';
import { OrderPreviewType } from 'app/@types/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrderPreviewContextType {
  status: OrderPreviewType;
  setStatus: (status: OrderPreviewType) => void;
  tweetId: string;
  setTweetId: (tweetId: string) => void;
  tweetUrl: string;
  setTweetUrl: (tweetUrl: string) => void;
  isVerified: boolean;
  setIsVerified: (isVerified: boolean) => void;
  tweet: string;
  setTweet: (tweet: string) => void;
  reload: boolean;
  setReload: (reload: boolean) => void;
  isPost: boolean;
  setIsPost: (reload: boolean) => void;
}

const OrderPreviewContext = createContext<OrderPreviewContextType | undefined>(undefined);

export function OrderPreviewProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<OrderPreviewType>(OrderPreviewType.POST_NONE);
  const [tweetId, setTweetId] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [tweet, setTweet] = useState<string>('');
  const [tweetUrl, setTweetUrl] = useState<string>('');
  const [reload, setReload] = useState<boolean>(false);
  const [isPost, setIsPost] = useState<boolean>(false);
  return (
    <OrderPreviewContext.Provider
      value={{
        status,
        setStatus,
        tweetId,
        setTweetId,
        isVerified,
        setIsVerified,
        tweet,
        setTweet,
        tweetUrl,
        setTweetUrl,
        reload,
        setReload,
        isPost,
        setIsPost,
      }}
    >
      {children}
    </OrderPreviewContext.Provider>
  );
}

export function useOrderPreview() {
  const context = useContext(OrderPreviewContext);
  if (context === undefined) {
    throw new Error('useOrderPreview must be used within a OrderPreviewProvider');
  }
  return context;
}
