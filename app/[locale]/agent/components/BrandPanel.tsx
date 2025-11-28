import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureSlide } from '../types';
import { Icons } from './Icons';
import { useTranslations } from 'next-intl';

export const BrandPanel: React.FC = () => {
  const t = useTranslations('common');
  const [activeIndex, setActiveIndex] = useState(0);

  const features: FeatureSlide[] = [
    {
      id: 'agent',
      title: t('brand_panel_agent_title') || 'AI Agent',
      subtitle: t('brand_panel_agent_subtitle') || 'Automated Social Mining',
      description:
        t('brand_panel_agent_description') ||
        "Don't have time to post? Activate your personal AI Agent. It engages, tweets, and earns rewards automatically, 24/7.",
      iconName: 'bot',
      highlightColor: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'earn',
      title: t('brand_panel_earn_title') || 'Value Return',
      subtitle: t('brand_panel_earn_subtitle') || 'Your Voice, Monetized',
      description:
        t('brand_panel_earn_description') ||
        'Break the monopoly. Every tweet, reply, and interaction generates real value that flows directly back to your wallet.',
      iconName: 'twitter',
      highlightColor: 'from-blue-500 to-cyan-400',
    },
    {
      id: 'sentiment',
      title: t('brand_panel_sentiment_title') || 'Prediction',
      subtitle: t('brand_panel_sentiment_subtitle') || 'Sentiment Market',
      description:
        t('brand_panel_sentiment_description') ||
        "Transform your intuition into profit. Predict public opinion trends on hot topics and win rewards when you're right.",
      iconName: 'chart',
      highlightColor: 'from-emerald-500 to-teal-400',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 8000); // Slower rotation
    return () => clearInterval(timer);
  }, []);

  const activeFeature = features[activeIndex];

  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden px-12 py-12 lg:px-24">
      {/* Dynamic Background Gradient - subtle and atmospheric */}
      <div className="absolute inset-0 bg-zinc-50 transition-colors duration-1000 dark:bg-black">
        <div
          className={`absolute top-0 right-0 h-[800px] w-[800px] bg-gradient-to-b ${activeFeature.highlightColor} translate-x-1/3 -translate-y-1/4 transform rounded-full opacity-[0.03] blur-[120px] transition-all duration-1000 dark:opacity-[0.08]`}
        ></div>
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-zinc-400/10 blur-[100px] dark:bg-zinc-800/20"></div>
      </div>

      {/* Grid Lines - Architectural feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      ></div>

      <div className="relative z-10 max-w-3xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFeature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Elegant easing
            className="flex flex-col gap-8"
          >
            {/* Abstract Visual Representation */}
            <div className="relative mb-4 h-24 w-24">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr opacity-40 blur-2xl ${activeFeature.highlightColor}`}
              ></div>
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white/50 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                {/* Inner shimmer */}
                <div className="absolute inset-0 animate-[shimmer_3s_infinite] bg-gradient-to-tr from-white/0 via-white/20 to-transparent opacity-0"></div>

                {activeFeature.id === 'agent' && (
                  <Icons.Bot
                    className="h-10 w-10 text-zinc-800 dark:text-white"
                    strokeWidth={1.5}
                  />
                )}
                {activeFeature.id === 'earn' && (
                  <Icons.Twitter className="h-10 w-10 text-zinc-800 dark:text-white" />
                )}
                {activeFeature.id === 'sentiment' && (
                  <Icons.Chart
                    className="h-10 w-10 text-zinc-800 dark:text-white"
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>

            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mb-4 flex items-center gap-3"
              >
                <span
                  className={`h-px w-8 bg-gradient-to-r ${activeFeature.highlightColor}`}
                ></span>
                <span className="text-sm font-semibold tracking-widest text-zinc-500 uppercase dark:text-zinc-400">
                  {activeFeature.subtitle}
                </span>
              </motion.div>

              <h1 className="mb-8 text-6xl leading-[1.1] font-bold tracking-tighter text-zinc-900 lg:text-7xl dark:text-white">
                {activeFeature.title}
              </h1>

              <p className="max-w-xl text-xl leading-relaxed font-light text-zinc-500 lg:text-2xl dark:text-zinc-400">
                {activeFeature.description}
              </p>
            </div>

            {/* Contextual Stats/Tags */}
            <div className="flex gap-4 pt-4">
              {activeFeature.id === 'agent' && (
                <>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:border-white/5 dark:bg-white/5 dark:text-zinc-300">
                    {t('brand_panel_agent_tag_1') || '⚡ 24/7 Active'}
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:border-white/5 dark:bg-white/5 dark:text-zinc-300">
                    {t('brand_panel_agent_tag_2') || '🤖 Smart Auto-Reply'}
                  </div>
                </>
              )}
              {activeFeature.id === 'earn' && (
                <>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:border-white/5 dark:bg-white/5 dark:text-zinc-300">
                    {t('brand_panel_earn_tag_1') || '💰 USDT Rewards'}
                  </div>
                  <div className="rounded-lg border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm text-zinc-600 dark:border-white/5 dark:bg-white/5 dark:text-zinc-300">
                    {t('brand_panel_earn_tag_2') || '🎟️ Weekly Raffles'}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern Progress Line */}
      <div className="relative mt-auto h-1 w-full max-w-md overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <motion.div
          className="absolute top-0 left-0 h-full bg-zinc-900 dark:bg-white"
          initial={{ width: '0%' }}
          animate={{ width: `${((activeIndex + 1) / features.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="mt-4 text-sm font-medium text-zinc-400">
        0{activeIndex + 1} <span className="mx-2 text-zinc-300 dark:text-zinc-700">/</span> 03
      </div>
    </div>
  );
};
