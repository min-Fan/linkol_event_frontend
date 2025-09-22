'use client';
import CompActives from './components/Actives';
import CompLeadboard from './components/Leadboard';
import CompTweets from './components/Tweets';
import CompProjectApplication from './components/ProjectApplication';
import { useQuery } from '@tanstack/react-query';
import { getActivityFollowers } from '@libs/request';
import { useAppSelector } from '@store/hooks';

export default function MarketEventsPage() {
  const isLoggedIn = useAppSelector((state) => state.userReducer?.isLoggedIn);
  const { data: followers } = useQuery({
    queryKey: ['activityFollowers'],
    queryFn: () => getActivityFollowers(),
    enabled: !!isLoggedIn,
  });
  return (
    <div className="mx-auto box-border w-full max-w-[1100px] space-y-5 p-0">
      {/* <CompBanner /> */}
      <CompActives />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <div className="w-full sm:w-96 sm:min-w-96">
          <CompLeadboard />
        </div>
        <div className="w-full sm:min-w-0 sm:flex-1">
          <CompTweets />
        </div>
      </div>
      {/* <CompProjectApplication /> */}
    </div>
  );
}
