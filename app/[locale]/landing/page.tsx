'use client';

import { useTranslations } from 'next-intl';
import Landing from '@assets/image/lading/landing.webp';
import FaultyTerminal from '@ui/FaultyTerminal/FaultyTerminal';
import { Button } from '@shadcn/components/ui/button';
import { PixelarticonsArrowRight } from '@assets/svg';

export default function PageCHome() {
  const t = useTranslations('common');

  return (
    <div className="relative flex h-[100vh] min-h-[100vh] w-full items-center justify-center">
      <div className="absolute top-0 left-0 z-0 h-full w-full">
        <FaultyTerminal
          scale={2.7}
          gridMul={[2, 1]}
          digitSize={1.2}
          timeScale={0.4}
          pause={false}
          scanlineIntensity={0.5}
          glitchAmount={1}
          flickerAmount={1}
          noiseAmp={1}
          chromaticAberration={0}
          dither={0}
          curvature={0.35}
          tint="#007AFF"
          mouseReact={true}
          mouseStrength={0.5}
          pageLoadAnimation={false}
          brightness={0.6}
        />
      </div>
      <div className="pointer-events-none relative z-20 flex w-full flex-col items-center justify-center gap-6 p-4 sm:flex-row sm:gap-0 sm:p-0">
        <div className="pointer-events-auto flex flex-col items-center justify-center gap-4 sm:-mr-12 sm:gap-2">
          <h1 className="font-kyiv text-center text-[24px] leading-normal font-bold text-white [-webkit-text-stroke:1px_#00F6FF] [text-shadow:0_4px_20px_rgba(0,246,255,0.80)] sm:text-[28px] md:text-[32.292px]">
            NO FOLLOW, NO ENTRY
          </h1>
          <Button
            className="font-kyiv flex !h-auto w-full items-center justify-center !rounded-none px-6 py-3 text-base sm:w-full sm:text-lg"
            onClick={() => {
              window.open('https://x.com/linkol_ai', '_blank');
            }}
          >
            <span>Follow on X</span>
            <PixelarticonsArrowRight className="animate-float-right mt-1" />
          </Button>
        </div>
        <img
          src={Landing.src}
          alt=""
          className="pointer-events-auto max-h-[min(80vh,800px)] w-full object-contain sm:w-auto"
        />
      </div>
    </div>
  );
}
