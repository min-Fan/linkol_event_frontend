import { useAppSelector } from '@store/hooks';
import Header from '@ui/header';
import QuoteExplanationModal from '@ui/dialog/QuoteExplanationModal';
import CompBanner from './Banner';
import CompOrderProgress from './OrderProgress';
import CompScenes from './Scenes';
import CompOrderPreview from './OrderPreview';
import CompKOLTotalData from './KOLTotalData';
import Footer from '@ui/footer';
import KOLSquarePanel from './KOLSquarePanel';
import useOrderProgress from '@hooks/uesOrderProgress';
import { ORDER_PROGRESS } from '@constants/app';

export default function Home() {
  const isView = useAppSelector((state) => state.userReducer?.is_view_quote_explanation_modal);
  const { orderProgress } = useOrderProgress();
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <div className="mx-auto box-border flex h-full w-full max-w-[1600px] flex-1 items-start gap-x-4 p-4">
        <article className="w-full flex-1 space-y-4 overflow-hidden">
          <CompBanner />
          <CompOrderProgress />
          <CompScenes />
        </article>
        <aside className="sticky top-20 right-0 z-10 hidden h-[calc(100dvh-6rem)] w-100 min-w-100 lg:block xl:w-115">
          <div className="flex h-full w-full flex-col gap-y-4">
            <CompKOLTotalData />
            <CompOrderPreview />
          </div>
        </aside>
      </div>
      {orderProgress === ORDER_PROGRESS.KOL_SQUARE && (
        <div className="sticky bottom-0 left-0 z-[10] mx-auto box-border flex h-full w-full max-w-[1600px] items-start">
          <div className="box-border w-full px-0 sm:px-4 lg:pr-108 xl:pr-123">
            <div className="bg-background/30 border-border mx-auto box-border rounded-t-xl border border-b-0 px-0 shadow-lg backdrop-blur-sm sm:rounded-t-3xl sm:px-4 dark:shadow-[0px_4px_6px_0px_rgba(255,255,255,0.05)]">
              <KOLSquarePanel />
            </div>
          </div>
        </div>
      )}
      <Footer />

      {!isView && <QuoteExplanationModal></QuoteExplanationModal>}
    </div>
  );
}
