import React from 'react';

export default function HowItWork() {
  return (
    <div className="border-border bg-muted/20 space-y-3 rounded-3xl border px-4 py-5">
      {/* How it work? */}
      <h3 className="font-semibold">How it work?</h3>
      <ul className="text-muted-foreground space-y-2 text-sm">
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>Deposit funds based on the opinion or side you agree with.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>Wait until the campaign ends.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>Profiles will be shared at the end of the campaign.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>The side with the higher brand value wins.</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="flex mt-2 text-primary w-1 h-1 rounded-full bg-primary"></span>
          <span>KOL receives 5% of the total pool as a reward.</span>
        </li>
      </ul>
    </div>
  );
}
