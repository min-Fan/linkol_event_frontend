import CompBanner from './components/Banner';
import CompActives from './components/Actives';
import CompLeadboard from './components/Leadboard';
import CompTweets from './components/Tweets';
import CompProjectApplication from './components/ProjectApplication';

export default function MarketEventsPage() {
  return (
    <div className="mx-auto box-border w-full max-w-7xl space-y-5 p-0 sm:px-10 sm:py-8">
      <CompBanner />
      <CompActives />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="w-full lg:w-96 lg:min-w-96">
          <CompLeadboard />
        </div>
        <div className="w-full lg:min-w-0 lg:flex-1">
          <CompTweets />
        </div>
      </div>
      {/* <CompProjectApplication /> */}
    </div>
  );
}
