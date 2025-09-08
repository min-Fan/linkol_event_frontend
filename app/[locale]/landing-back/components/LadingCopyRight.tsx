import { LadingpageIn, LadingpageTw } from '@assets/svg';

export default function LadingCopyRight() {
  return (
    <div className="mt-30 box-border w-full px-5 text-[#637387]">
      <div className="m-auto box-border px-5 md:max-w-240">
        <div className="flex items-center justify-between text-base">
          <div>Privacy Policy</div>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <LadingpageTw className="size-4"></LadingpageTw>
              <LadingpageIn className="size-4"></LadingpageIn>
            </div>
            <div className="text-center">
              <div>Terms of Service</div>
              <div>@2024 Linkol. All rights reserved.</div>
            </div>
          </div>
          <div>Privacy Policy</div>
        </div>
      </div>
    </div>
  );
}
