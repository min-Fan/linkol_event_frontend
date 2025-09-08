let channel: BroadcastChannel | null = null;

/** 所有支持的事件类型 */
export enum ChannelEventType {
  REFRESH_DATA = 'REFRESH_DATA',
  LOGIN_STATUS = 'LOGIN_STATUS',
}

export enum LoginStatus {
  PENDING = 'pending',
  WAITING = 'waiting',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type LoginMethod = 'TwitterAuth' | 'TwitterPost';

/** 每个事件对应的 payload 类型定义 */
export interface ChannelEventPayloadMap {
  [ChannelEventType.REFRESH_DATA]: { resource: string };
  [ChannelEventType.LOGIN_STATUS]: {
    status: LoginStatus;
    userInfo: any;
    method: LoginMethod;
  };
}

/** 完整的事件结构 */
export interface ChannelEvent<T extends ChannelEventType = ChannelEventType> {
  type: T;
  payload: ChannelEventPayloadMap[T];
  id: string;
  timestamp: number;
  from?: string;
}

/** 初始化 Channel 实例（SSR 安全） */
export function initChannel(channelName = 'my-channel') {
  if (typeof window === 'undefined') return null;
  if (!channel) {
    channel = new BroadcastChannel(channelName);
  }
  return channel;
}

/** 发送事件 */
export function postEvent<T extends ChannelEventType>(
  type: T,
  payload: ChannelEventPayloadMap[T]
): string {
  const ch = initChannel();
  const message: ChannelEvent<T> = {
    type,
    payload,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    from: window?.name || undefined,
  };
  ch?.postMessage(message);
  return message.id;
}

/**
 * 通用监听函数，可指定监听的类型列表
 * @param listener 回调函数
 * @param filterTypes 可选，指定要监听的类型
 * @returns 返回取消监听函数
 */
export function subscribe<T extends ChannelEventType = ChannelEventType>(
  listener: (event: ChannelEvent<T>) => void,
  filterTypes?: T[]
): () => void {
  const ch = initChannel();
  if (!ch) return () => {};

  const handler = (e: MessageEvent<ChannelEvent>) => {
    const event = e.data;
    if (filterTypes && !filterTypes.includes(event.type as T)) return;
    listener(event as ChannelEvent<T>);
  };

  ch.addEventListener('message', handler);
  return () => ch.removeEventListener('message', handler);
}

/**
 * 更简洁的监听某一类型事件的函数（自动推断 payload）
 * @param type 指定事件类型
 * @param handler 回调函数，仅处理 payload
 * @returns 返回取消监听函数
 */
export function subscribeTo<T extends ChannelEventType>(
  type: T,
  handler: (payload: ChannelEventPayloadMap[T]) => void
): () => void {
  return subscribe(
    (event) => {
      if (event.type === type) {
        handler(event.payload);
      }
    },
    [type]
  );
}
