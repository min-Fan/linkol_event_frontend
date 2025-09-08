'use client';
import avatar from '@assets/image/avatar.png';
import { formatNumberKMB } from '@libs/utils';
import { Card, CardContent } from '@shadcn/components/ui/card';
export default function ProductItem(data: any) {
  return (
    <Card className="h-125 w-119 flex-none overflow-hidden rounded-3xl border-2 !border-[rgba(0,122,255,0.15)] p-0 shadow-none">
      <CardContent className="flex h-full w-full flex-col p-0">
        <div className="relative h-54 w-full">
          <img src={data?.data?.cover_img} alt="avatar" className="size-full" />
          <div className="text-muted-foreground absolute top-5 left-6.5 flex h-7.5 w-21 items-center justify-center rounded-full bg-[rgba(255,255,255,0.8)] text-base font-medium">
            Product
          </div>
        </div>
        <div className="mt-11 flex flex-1 flex-col justify-between px-6">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xl font-medium">{data?.data?.title}</span>
              <div className="flex h-8.5 items-center justify-center rounded-full bg-[#EBEDF0] px-4 text-base font-medium">
                ${data?.data?.reward_amount}
              </div>
            </div>
            <div className="line-clamp-3 h-[4.5rem] text-base leading-relaxed font-medium">
              {data?.data?.description}
            </div>

            <div className="flex items-center justify-between text-base font-medium text-[#999]">
              <span>{data?.data?.days_remaining} days left</span>
              <span>{formatNumberKMB(data?.data?.participants)} participants</span>
            </div>
          </div>

          <div className="flex items-center justify-between pb-5">
            <div className="flex items-center gap-3.5">
              <img src={data?.data?.project?.logo} alt="avatar" className="size-9 rounded-full" />
              <span className="text-md font-medium">{data?.data?.project?.name}</span>
            </div>

            <div className="text-primary text-xl font-medium">View</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
