import { useAppSelector } from '@store/hooks';
import TweetView from './TweetView';
import { Card, CardContent } from '@shadcn/components/ui/card';
import OrderPreviewProfile from './OrderPreviewProfile';
import useOrderProgress from '@hooks/uesOrderProgress';

import KOLAnalysisReport from './KOLAnalysisReport';
import TypingMarkdown from 'app/components/TypingMarkdown';

export default function Preview() {
  const quickOrder = useAppSelector((state) => state.userReducer?.quickOrder);
  const { orderProgress } = useOrderProgress();
  const selectedKOLInfo = useAppSelector((state) => state.userReducer?.selectedKOLInfo);

  return (
    <Card className="h-full w-full flex-1 overflow-hidden rounded-3xl border-none p-0">
      <CardContent className="h-full min-h-0 w-full p-0">
        <div className="flex h-full w-full flex-col">
          <div className="border-border flex h-full w-full flex-col">
            <div>
              <OrderPreviewProfile />
            </div>
            <div className="box-border h-full flex-1 overflow-hidden rounded-3xl py-2">
              <div className="h-full w-full">
                <div className="box-border h-full w-full px-2">
                  {orderProgress == 1 && quickOrder?.project_id ? (
                    <div className="h-full w-full">
                      <TweetView></TweetView>
                    </div>
                  ) : selectedKOLInfo?.ai_analysis ? (
                    <TypingMarkdown messages={[selectedKOLInfo?.ai_analysis]}></TypingMarkdown>
                  ) : (
                    <KOLAnalysisReport></KOLAnalysisReport>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
