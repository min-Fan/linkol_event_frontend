'use client';
import React from 'react';
import Chat from '../compontents/Chat';
export default function ChatPage() {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="mx-auto box-border flex h-fit min-h-0 w-full max-w-[1600px] flex-1 flex-col">
        <Chat />
      </div>
    </div>
  );
}
