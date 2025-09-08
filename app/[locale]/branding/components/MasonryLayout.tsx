import React from 'react';
import ai from '@assets/image/ai/1.png';
import { formatNumberKMB } from '@libs/utils';
interface listData {
  name: string;
  icon: string;
  amount: number;
}
export default function EqualHeightColumns({ data }: { data: listData[] }) {
  const splitCount = [2, 3, 4];

  function splitByCount<T>(arr: T[], counts: number[]): T[][] {
    let start = 0;
    return counts.map((count) => {
      const slice = arr.slice(start, start + count);
      start += count;
      return slice;
    });
  }

  // 生成随机颜色的函数
  function getRandomColor() {
    // 生成亮度适中的颜色，避免太浅或太深，方便看内容
    const r = Math.floor(100 + Math.random() * 155);
    const g = Math.floor(100 + Math.random() * 155);
    const b = Math.floor(100 + Math.random() * 155);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function Column({ items }: { items: listData[] }) {
    return (
      <div className="flex h-132 flex-1 flex-col gap-1">
        {items.map((item, i) => (
          <div key={i} className="bg-background box-border flex flex-1 items-center justify-center">
            <div
              className="h-full w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundColor: getRandomColor(),
                backgroundImage: `url(${ai.src})`,
              }}
            >
              <div className="p-4">
                <p className="text-2xl font-bold text-[#fff] text-shadow-[0px_2px_8px_rgba(0,0,0,0.6)]">
                  {item.name}
                </p>
                <p className="text-xl font-medium text-[#fff] text-shadow-[0px_2px_8px_rgba(0,0,0,0.6)]">
                  {formatNumberKMB(item.amount)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const columns = splitByCount(data, splitCount);

  return (
    <div className="mx-auto flex h-132 w-full gap-1">
      {columns.map((colItems, idx) => (
        <Column key={idx} items={colItems} />
      ))}
    </div>
  );
}
