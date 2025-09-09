import CompBanner from './components/Banner';
import CompActives from './components/Actives';
import CompLeadboard from './components/Leadboard';
import CompTweets from './components/Tweets';
import CompProjectApplication from './components/ProjectApplication';

export default function MarketEventsPage() {
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
