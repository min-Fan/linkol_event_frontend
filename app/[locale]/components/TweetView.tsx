import { getOrderContentGen } from '@libs/request';
import { useAppSelector } from '@store/hooks';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { LoaderCircle } from 'lucide-react';
import TypingMarkdownList from 'app/components/SequentialTyping';
export default function TweetView() {
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  const [posts, setPosts] = useState<any[]>([]);
  const t = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);
  const currendProjectId = useRef('');
  const currendTweetId = useRef('');

  useEffect(() => {
    if (
      currendProjectId.current != quickOrder?.project_id ||
      currendTweetId.current != quickOrder?.service_type_code
    ) {
      init();
    }
  }, [quickOrder?.project_id, quickOrder?.service_type_code]);

  const init = async () => {
    try {
      if (!quickOrder?.project_id) return toast.error(t('project_not_found'));
      currendProjectId.current = quickOrder?.project_id;
      currendTweetId.current = quickOrder?.service_type_code;
      setIsLoading(true);
      setPosts([]);

      const res = await getOrderContentGen({
        project_id: quickOrder?.project_id,
        service_type_code: quickOrder?.service_type_code,
      });
      if (res.code === 200 && res.data && Array.isArray(res.data)) {
        if (currendProjectId.current == quickOrder?.project_id) {
          setPosts(res.data);
        }
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="flex items-center space-x-2 rounded-md px-2 py-2">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span className="text-xs">{t('cntent_is_being_edited')}...</span>
        </div>
      ) : (
        <>
          <TypingMarkdownList posts={posts}></TypingMarkdownList>
        </>
      )}
    </div>
  );
}
