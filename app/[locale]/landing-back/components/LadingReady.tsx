import { LadingpageHuoBlue, LadingpageSuccess, LadingpageUserBlue } from '@assets/svg';
import { Button } from '@shadcn/components/ui/button';
import SpotlightCard from '@ui/spotlightCard';
import { useRouter } from '@libs/i18n/navigation';
import PagesRoute from '@constants/routes';
export default function LadingReady() {
  const router = useRouter();

  return (
    <div className="mt-30 box-border w-full px-5">
      <div className="m-auto box-border space-y-8 rounded-xl bg-gradient-to-r from-[#88BBF3] to-[#5C99F4] px-10 py-20 md:max-w-240">
        <div className="text-center text-4xl font-bold text-white">
          Ready to Elevate Your Web3 Project?
        </div>
        <div className="flex flex-wrap gap-8">
          <SpotlightCard
            spotlightColor="rgba(92, 153, 244, 0.4)"
            className="box-border flex-1 space-y-16 rounded-xl bg-white p-6 dark:bg-black"
          >
            <div className="flex items-center gap-x-2">
              <LadingpageHuoBlue className="size-5 text-[#88BBF3]"></LadingpageHuoBlue>
              <span className="text-xl font-bold">Join as Marketing manager</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-x-2">
                  <LadingpageSuccess className="size-4"></LadingpageSuccess>
                  <span className="text-base">Access a premium KOL resource library</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <LadingpageSuccess className="size-4"></LadingpageSuccess>
                  <span className="text-base">Precisely target your audience.</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <LadingpageSuccess className="size-4"></LadingpageSuccess>
                  <span className="text-base">
                    Transparent tracking of promotional effectiveness
                  </span>
                </div>
              </div>
              <Button
                className="h-12 w-full sm:h-12"
                onClick={() => {
                  router.push(PagesRoute.HOME);
                }}
              >
                <span className="text-base font-bold">Create Campaign</span>
              </Button>
            </div>
          </SpotlightCard>

          <SpotlightCard
            spotlightColor="rgba(92, 153, 244, 0.4)"
            className="box-border flex-1 space-y-16 rounded-xl bg-white p-6 dark:bg-black"
          >
            <div className="flex items-center gap-x-2">
              <LadingpageUserBlue className="size-5 text-[#88BBF3]"></LadingpageUserBlue>
              <span className="text-xl font-bold">Join as KOL</span>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-x-2">
                  <LadingpageSuccess className="size-4"></LadingpageSuccess>
                  <span className="text-base">
                    Discover high-quality project campaign collaboration opportunities.
                  </span>
                </div>
                <div className="flex items-center gap-x-2">
                  <LadingpageSuccess className="size-4"></LadingpageSuccess>
                  <span className="text-base">AI-powered content creation tool</span>
                </div>
                <div className="flex items-center gap-x-2">
                  <LadingpageSuccess className="size-4"></LadingpageSuccess>
                  <span className="text-base">Transparent commission settlement</span>
                </div>
              </div>
              <Button
                className="h-12 w-full sm:h-12"
                onClick={() => {
                  router.push(PagesRoute.KOL);
                }}
              >
                <span className="text-base font-bold">Join Now</span>
              </Button>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
