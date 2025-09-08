'use client';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface TypewriterProps {
  text: string;
  onComplete: () => void;
  delay?: number;
}

const Typewriter = ({ text, onComplete, delay = 10 }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // 当文本发生变化时重置状态
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      onComplete();
    }
  }, [currentIndex, delay, onComplete, text]);

  return <>{displayedText}</>;
};

export default function OrderPreviewThinking(props: { texts: string[] }) {
  const { texts } = props;
  const [displayedMessages, setDisplayedMessages] = useState<string[]>([]);
  const [currentTypingText, setCurrentTypingText] = useState<string | null>(null);
  const messageQueueRef = useRef<string[]>([]);
  const previousTextsRef = useRef<string[]>([]);
  const stableTextsRef = useRef<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化消息队列
  useEffect(() => {
    // 检查texts是否真的变更（通过比较内容而不仅是引用）
    const hasTextsChanged =
      texts.length !== previousTextsRef.current.length ||
      texts.some((text, index) => text !== previousTextsRef.current[index]);

    console.log(hasTextsChanged);

    if (texts.length > 0 && hasTextsChanged) {
      // 保存当前texts以便未来比较
      previousTextsRef.current = [...texts];

      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 设置新的定时器，等待500ms后检查texts是否稳定
      debounceTimerRef.current = setTimeout(() => {
        // 如果500ms内texts没有变化，则认为已经稳定
        if (JSON.stringify(texts) === JSON.stringify(previousTextsRef.current)) {
          stableTextsRef.current = [...texts];

          // 清空之前的状态
          setDisplayedMessages([]);
          setCurrentTypingText(null);
          messageQueueRef.current = [...texts];

          // 启动新的消息队列
          setTimeout(() => {
            sendNextMessage();
          }, 100);
        }
      }, 500);
    }

    // 清理函数
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      previousTextsRef.current = [];
      messageQueueRef.current = [];
      stableTextsRef.current = [];
    };
  }, [texts]);

  // 发送下一条消息
  const sendNextMessage = () => {
    if (messageQueueRef.current.length > 0) {
      const nextMessage = messageQueueRef.current.shift()!;
      setCurrentTypingText(nextMessage);
    } else {
      setCurrentTypingText(null);
    }
  };

  // 处理打字完成
  const handleTypingComplete = () => {
    if (currentTypingText) {
      // 将当前打字完成的消息添加到已显示消息列表
      setDisplayedMessages((prev) => [...prev, currentTypingText]);
      setCurrentTypingText(null);

      // 等待300ms后发送下一条消息
      setTimeout(() => {
        sendNextMessage();
      }, 300);
    }
  };

  return (
    <div className="border-primary flex flex-col space-y-3 border-l-2 pl-2">
      <AnimatePresence mode="popLayout">
        {/* 已显示完成的消息 */}
        {displayedMessages.map((message, index) => (
          <div key={`message-${index}`} className="bg-primary/10 rounded-md p-2">
            <p className="text-xs">{message}</p>
          </div>
        ))}

        {/* 当前正在打字的消息 */}
        {currentTypingText && (
          <motion.div
            key="current-typing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary/10 rounded-md p-2"
          >
            <p className="text-xs">
              <Typewriter text={currentTypingText} onComplete={handleTypingComplete} delay={10} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
