'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

import CompTweetLanguageTab, { TWEET_LANGUAGE } from './TweetLanguageTab';
import CompTweetRecord from './TweetRecord';

export default function Tweets() {
  const [language, setLanguage] = useState<TWEET_LANGUAGE>(TWEET_LANGUAGE.ALL);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 动画速度倍数
  const [animationDirection, setAnimationDirection] = useState<'normal' | 'reverse'>('normal');
  const [isDragging, setIsDragging] = useState(false);
  const [timePosition, setTimePosition] = useState(0); // 时间位置 0-100，从左端开始
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSliderHovered, setIsSliderHovered] = useState(false);
  const [wasAutoPlayingBeforeDrag, setWasAutoPlayingBeforeDrag] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [dataCount, setDataCount] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const onChangeLanguage = (language: TWEET_LANGUAGE) => {
    setLanguage(language);
  };

  const onDataChange = (hasData: boolean, dataCount: number, shouldAnimate: boolean) => {
    setHasData(hasData);
    setDataCount(dataCount);
    setShouldAnimate(shouldAnimate);

    // 如果没有数据或不需要动画，停止自动播放
    if (!hasData || !shouldAnimate) {
      setIsAutoPlay(false);
    } else {
      // 如果有数据且需要动画，自动开始播放
      setIsAutoPlay(true);
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640 || 'ontouchstart' in window);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // 更新CSS变量来控制动画速度和方向
  useEffect(() => {
    console.log('Animation control useEffect triggered');
    console.log('States:', {
      isAutoPlay,
      isHovered,
      isSliderHovered,
      isSliderDragging,
      shouldAnimate,
      isMobile,
    });

    if (containerRef.current && shouldAnimate) {
      const animationElements = containerRef.current.querySelectorAll('[data-row]');
      animationElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        // 移动端不考虑悬停状态，桌面端考虑悬停状态
        const shouldPlay = isAutoPlay && 
          (isMobile ? !isSliderDragging : !isHovered && !isSliderHovered && !isSliderDragging);
        console.log('Should play:', shouldPlay);
        htmlElement.style.animationPlayState = shouldPlay ? 'running' : 'paused';
        htmlElement.style.animationDirection = animationDirection;
        htmlElement.style.animationDuration = `${25 / animationSpeed}s`;
      });
    }
  }, [
    isAutoPlay,
    animationSpeed,
    animationDirection,
    isHovered,
    isSliderHovered,
    isSliderDragging,
    shouldAnimate,
    isMobile,
  ]);

  // 拖动手势处理
  const handleTouchStart = useRef<{ x: number; y: number } | null>(null);
  const handleMouseDown = useRef<{ x: number; y: number } | null>(null);

  const onPointerStart = (e: React.PointerEvent) => {
    const point = { x: e.clientX, y: e.clientY };
    handleTouchStart.current = point;
    handleMouseDown.current = point;
    setIsDragging(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!handleTouchStart.current) return;

    const deltaX = e.clientX - handleTouchStart.current.x;
    const deltaY = Math.abs(e.clientY - handleTouchStart.current.y);

    // 只处理水平拖动
    if (deltaY > 30) return;

    // 设置拖动状态
    if (Math.abs(deltaX) > 10) {
      setIsDragging(true);
    }

    // 根据拖动距离计算速度和方向
    const distance = Math.abs(deltaX);
    const speed = Math.min(Math.max(distance / 100, 0.1), 3); // 速度范围 0.1-3倍
    const direction = deltaX > 0 ? 'reverse' : 'normal';

    setAnimationSpeed(speed);
    setAnimationDirection(direction);
  };

  const onPointerEnd = () => {
    handleTouchStart.current = null;
    handleMouseDown.current = null;
    setIsDragging(false);

    // 恢复正常速度和方向
    setTimeout(() => {
      setAnimationSpeed(1);
      setAnimationDirection('normal');
    }, 500);
  };

  // 滑块控制函数
  const handleSliderPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsSliderDragging(true);
    setWasAutoPlayingBeforeDrag(isAutoPlay); // 记录拖动前的自动播放状态
    setIsAutoPlay(false); // 拖动时暂停自动播放

    const rect = sliderRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setTimePosition(percentage);
      updateAnimationByTime(percentage);
    }
  };

  const handleSliderPointerUp = () => {
    if (isSliderDragging) {
      console.log('Slider pointer up - starting recovery');
      console.log('Current states:', { isHovered, isSliderHovered, isAutoPlay });

      setIsSliderDragging(false);
      // 松开后恢复到正常速度，但保持当前位置
      setAnimationSpeed(1);
      setAnimationDirection('normal');

      // 强制继续自动播放
      console.log('Setting autoplay to true');
      setIsAutoPlay(true);

      // 额外确保动画继续
      setTimeout(() => {
        console.log('Timeout: Forcing animation restart');
        setIsAutoPlay(true);

        // 直接操作DOM确保动画运行
        if (containerRef.current) {
          const animationElements = containerRef.current.querySelectorAll('[data-row]');
          animationElements.forEach((element) => {
            const htmlElement = element as HTMLElement;
            console.log('Setting animation state to running for element');
            htmlElement.style.animationPlayState = 'running';
          });
        }
      }, 100);
    }
  };

  // 根据时间位置更新动画
  const updateAnimationByTime = (position: number) => {
    // position 0-100 映射到时间控制
    // 滑块从左往右移动：左侧(0)=快速后退，中间(50)=正常，右侧(100)=快速前进
    if (position > 50) {
      // 前进 - 右侧
      const speed = ((position - 50) / 50) * 2 + 0.5; // 0.5-2.5倍速
      setAnimationDirection('normal');
      setAnimationSpeed(speed);
    } else if (position < 50) {
      // 后退 - 左侧
      const speed = ((50 - position) / 50) * 2 + 0.5; // 0.5-2.5倍速
      setAnimationDirection('reverse');
      setAnimationSpeed(speed);
    } else {
      // 正常速度 - 中间
      setAnimationSpeed(1);
      setAnimationDirection('normal');
    }
  };

  // 自动播放时滑块从左往右循环移动
  useEffect(() => {
    // 移动端不考虑悬停状态，桌面端考虑悬停状态
    const shouldMoveSlider = isAutoPlay && shouldAnimate && !isSliderDragging && 
      (isMobile ? true : !isHovered && !isSliderHovered);
    
    if (shouldMoveSlider) {
      const interval = setInterval(() => {
        setTimePosition((prev) => {
          // 从左往右循环移动 (0 -> 100)
          const newPos = prev + 0.3; // 每次增加0.3%，速度适中
          return newPos >= 100 ? 0 : newPos; // 到达右端时回到左端
        });
      }, 100); // 100ms间隔，流畅且不过于频繁

      return () => clearInterval(interval);
    }
  }, [isAutoPlay, shouldAnimate, isSliderDragging, isHovered, isSliderHovered, isMobile]);

  // 添加全局事件监听处理滑块拖动
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isSliderDragging && sliderRef.current) {
        e.preventDefault(); // 防止默认行为造成卡顿
        const rect = sliderRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        // 使用 requestAnimationFrame 优化性能
        requestAnimationFrame(() => {
          setTimePosition(percentage);
          updateAnimationByTime(percentage);
        });
      }
    };

    const handleGlobalPointerUp = () => {
      if (isSliderDragging) {
        handleSliderPointerUp();
      }
    };

    if (isSliderDragging) {
      document.addEventListener('pointermove', handleGlobalPointerMove, { passive: false });
      document.addEventListener('pointerup', handleGlobalPointerUp);
    }

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove);
      document.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isSliderDragging]);

  return (
    <div className="border-border bg-background box-border flex h-full flex-col space-y-4 rounded-3xl border p-4 sm:p-6">
      <div className="item flex flex-col justify-between gap-3 sm:flex-row">
        <CompTweetLanguageTab
          defaultLanguage={TWEET_LANGUAGE.ALL}
          onChangeAction={onChangeLanguage}
        />
      </div>
      <div
        ref={containerRef}
        className={`touch-pan-y ${isDragging ? 'dragging' : ''}`}
        onPointerDown={onPointerStart}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerLeave={onPointerEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CompTweetRecord language={language} onDataChange={onDataChange} />
      </div>
      {/* 底部时间控制滑块 - 只有在有数据且需要动画时才显示 */}
      {hasData && shouldAnimate && (
        <div className="mt-auto pt-4 hidden sm:block">
          <div className="flex items-center gap-4">
            <div className="bg-muted-foreground/5 hover:bg-muted-foreground/10 flex items-center gap-2 rounded-lg p-2">
              <ChevronLeft className="size-4" />
            </div>
            {/* 时间控制滑块 */}
            <div
              className="relative flex-1"
              onMouseEnter={() => setIsSliderHovered(true)}
              onMouseLeave={() => setIsSliderHovered(false)}
            >
              <div
                ref={sliderRef}
                className="bg-secondary relative h-[1px] cursor-pointer rounded-full select-none"
                onPointerDown={handleSliderPointerDown}
              >
                {/* 滑块轨道 */}
                <div className="via-primary absolute inset-0 rounded-full bg-gradient-to-r from-red-400 to-green-400 opacity-30"></div>

                {/* 滑块手柄 */}
                <div
                  className={`bg-primary absolute top-1/2 h-3 w-4 -translate-y-1/2 transform rounded-sm shadow-lg hover:scale-110 ${isSliderDragging ? 'scale-110 shadow-xl transition-none' : 'transition-all duration-150'}`}
                  style={{
                    left: `calc(${timePosition}% - 12px)`,
                    transition: isSliderDragging ? 'none' : 'all 0.15s ease',
                  }}
                ></div>
              </div>
            </div>
            <div className="bg-muted-foreground/5 hover:bg-muted-foreground/10 flex items-center gap-2 rounded-lg p-2">
              <ChevronRight className="size-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
