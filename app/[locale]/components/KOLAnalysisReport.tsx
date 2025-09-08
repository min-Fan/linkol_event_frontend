'use client';
import { useAppSelector } from '@store/hooks';
import { chat } from '@libs/request';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import TypingMarkdown from 'app/components/TypingMarkdown';
export default function KOLAnalysisReport() {
  const selectedKOLInfo = useAppSelector((state) => state.userReducer?.selectedKOLInfo);
  const locale = useLocale();
  const [message, setMessage] = useState('正在获取kol报告...');
  const currentKOLRef = useRef<string | null>(null);
  useEffect(() => {
    if (currentKOLRef.current !== selectedKOLInfo?.screen_name) {
      setMessage('正在获取kol报告...');
      init();
      currentKOLRef.current = selectedKOLInfo?.screen_name || null;
    }
  }, [selectedKOLInfo?.screen_name]);

  const init = async () => {
    try {
      if (!selectedKOLInfo?.screen_name) return;
      const response: any = await chat({
        messages: [{ role: 'user', content: `分析一下KOL: @${selectedKOLInfo?.screen_name}` }],
        language: locale,
      });
      if (response.code === 200) {
        if (currentKOLRef.current === selectedKOLInfo?.screen_name) {
          setMessage(response.data);
        }
      }
    } catch (error) {}
  };

  return <TypingMarkdown messages={[message]} duration={1000}></TypingMarkdown>;
}
