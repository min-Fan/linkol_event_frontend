import React, { useEffect, useState } from 'react';

interface TypingParagraphsProps {
  messages: string[];
}

const TypingParagraphs: React.FC<TypingParagraphsProps> = ({ messages }) => {
  const [currentText, setCurrentText] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);

  const getRandomSpeed = () => Math.floor(Math.random() * 5) + 5; // 50~150ms

  // 每次 messages 变化时，重置打字状态
  useEffect(() => {
    if (messages && Array.isArray(messages)) {
      setCurrentText(messages.length > 0 ? [''] : []);
    } else {
      setCurrentText([]);
    }
    setCurrentMessageIndex(0);
    setCharIndex(0);
  }, [messages]);

  useEffect(() => {
    if (!messages || !Array.isArray(messages)) return;
    if (currentMessageIndex >= messages.length) return;

    const currentMessage = messages[currentMessageIndex];

    if (charIndex < currentMessage.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => {
          const updated = [...prev];
          updated[currentMessageIndex] =
            (updated[currentMessageIndex] || '') + currentMessage[charIndex];
          return updated;
        });
        setCharIndex(charIndex + 1);
      }, getRandomSpeed());

      return () => clearTimeout(timeout);
    } else {
      // 当前段落打完，如果还有下一段，就准备下一个段落
      if (currentMessageIndex < messages.length - 1) {
        const timeout = setTimeout(() => {
          setCurrentText((prev) => [...prev, '']);
          setCurrentMessageIndex(currentMessageIndex + 1);
          setCharIndex(0);
        }, 300); // 段落之间的间隔
        return () => clearTimeout(timeout);
      }
    }
  }, [charIndex, currentMessageIndex, messages]);

  return (
    <div className="border-primary flex flex-col space-y-3 border-l-2 pl-2">
      {currentText.map((text, index) => (
        <div key={`${index}`} className="bg-primary/10 text-md rounded-md p-2">
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
};

export default TypingParagraphs;
