import { getTweetByOrderId } from '@libs/request';
import { IKol, Media } from 'app/@types/types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bookmark, ChartNoAxesColumn, Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
interface tweet {
  content: string;
  likes: number;
  medias: Media[];
  replay: number;
  reposts: number;
  view: number;
}
export default function TweetView({ kol }: { kol: IKol }) {
  const { orderId } = useParams();
  const [tweetInfo, setTweetInfo] = useState<tweet[]>([]);
  useEffect(() => {
    init();
  }, [orderId]);
  const init = async () => {
    try {
      const res: any = await getTweetByOrderId({ order_item_id: orderId });
      if (res && res.code === 200) {
        setTweetInfo(res.data || []);
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderImages = (medias) => {
    if (medias.length === 1) {
      return (
        <div className="mt-2">
          <img src={medias[0].media_url_https} className="w-full rounded-xl object-cover" />
        </div>
      );
    }
    if (medias.length === 2) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.map((item, i) => (
            <img
              key={i}
              src={item.media_url_https}
              className="h-40 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      );
    }
    if (medias.length === 3) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <img
            src={medias[0].media_url_https}
            className="col-span-2 h-40 w-full rounded-xl object-cover"
          />
          {medias.slice(1).map((item, i) => (
            <img key={i} src={item} className="h-40 w-full rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    if (medias.length >= 4) {
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          {medias.slice(0, 4).map((item, i) => (
            <img
              key={i}
              src={item.media_url_https}
              className="h-40 w-full rounded-xl object-cover"
            />
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2">
      {tweetInfo.map((item, index) => {
        return (
          <div
            className="text-md bg-secondary box-border flex max-w-85 flex-col gap-2 rounded-2xl p-4"
            key={index}
          >
            <div className="flex w-full items-center gap-2">
              <div className="h-10 w-10 overflow-hidden rounded-full">
                <img src={kol?.profile_image_url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col gap-x-0.5">
                  <span className="text-md font-bold">{kol?.name}</span>
                  <span className="text-muted-foreground text-xs">@{kol?.username}</span>
                </div>
              </div>
            </div>
            <div className="text-md w-full">
              <p>{item?.content}</p>
              {item?.medias && renderImages(item?.medias)}
            </div>
            <div className="text-muted-foreground flex items-center gap-x-4">
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{item?.replay}</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <Repeat2 className="h-4 w-4" />
                <span>{item?.reposts}</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <Heart className="relative z-10 h-4 w-4" />
                <span>{item?.likes}</span>
              </div>
              <span>·</span>
              <div className="relative flex items-center space-x-1">
                <ChartNoAxesColumn className="relative z-10 h-4 w-4" />
                <span>{item?.view}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
