'use client';

import React, { useRef, useState } from 'react';
import { Icons } from './Icons';
import XAuth from '@ui/profile/components/XAuth';
import { useTranslations } from 'next-intl';

export const LoginForm: React.FC = () => {
  const t = useTranslations('common');
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div className="z-10 flex w-full flex-col items-center justify-center p-6 lg:p-12">
      {/* Login Card with Spotlight Effect */}
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-white/5 dark:bg-zinc-900 dark:shadow-none"
      >
        {/* Spotlight Gradient */}
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.1), transparent 40%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center p-10 text-center">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 shadow-inner dark:border-zinc-700 dark:bg-zinc-800">
            <Icons.Twitter className="h-8 w-8 text-black dark:text-white" />
          </div>

          <h3 className="mb-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {t('login_form_connect') || 'Connect'}
          </h3>
          <p
            className="mb-10 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
            dangerouslySetInnerHTML={{
              __html:
                t('login_form_description') ||
                'Join the SocialFi ecosystem. <br /> Your influence, now liquidated.',
            }}
          />

          {/* Use XAuth component with custom button */}
          <XAuth
            className="!h-14 !px-6"
            button={
              <>
                <span>{t('login_form_sign_in_twitter') || 'Sign in with Twitter'}</span>
                <Icons.ArrowRight size={16} />
              </>
            }
          />

          <div className="mt-8 flex w-full items-center justify-between border-t border-zinc-100 pt-6 text-xs text-zinc-400 dark:border-white/5 dark:text-zinc-600">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              {t('login_form_agent_active') || 'Agent Active'}
            </span>
            <span>{t('login_form_powered_by') || 'Powered by Linkol'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Links */}
      {/* <div className="mt-12 flex gap-6 text-xs font-medium tracking-wider text-zinc-400 uppercase dark:text-zinc-600">
        <a href="#" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-300">
          {t('login_form_documentation') || 'Documentation'}
        </a>
        <a href="#" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-300">
          {t('login_form_privacy') || 'Privacy'}
        </a>
        <a href="#" className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-300">
          {t('login_form_support') || 'Support'}
        </a>
      </div> */}
    </div>
  );
};
