import Image from 'next/image';
import { blo } from 'blo';
import { UserRound } from 'lucide-react';
import clsx from 'clsx';

export default function UserAvatar(props: { username: string; className?: string }) {
  const { username, className = 'size-6' } = props;

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      {username ? (
        <div className="border-border box-border size-full overflow-hidden rounded-full border">
          <Image
            className="size-full"
            src={blo(username as `0x${string}`)} // 将图案转换为 Base64 URL
            alt={username}
            width={32}
            height={32}
            style={{ borderRadius: '50%' }} // 圆形样式
          />
        </div>
      ) : (
        <UserRound className="size-4 text-white" />
      )}
    </div>
  );
}
