import React from 'react';

interface ChatThinkingProps {
  messages?: string[];
  message?: string; // 保持向后兼容
}

export default function ChatThinking({ messages, message }: ChatThinkingProps) {
  // 支持两种传入方式：messages数组或单个message
  const allMessages = messages || (message ? [message] : ['Doing...']);

  // 去重逻辑：移除重复的消息
  const displayMessages = allMessages.filter((msg, index, array) => array.indexOf(msg) === index);

  return (
    <div className="border-primary/20 bg-primary/5 flex flex-col gap-0 border-l-2 px-2">
      {displayMessages.map((msg, index) => (
        <div key={index} className="text-md text-muted-foreground box-border inline-block">
          <p>{msg}</p>
        </div>
      ))}
    </div>
  );
}
