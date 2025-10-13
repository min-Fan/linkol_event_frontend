'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AvatarData {
  id: string;
  name: string;
  avatar?: string;
  value?: number; // 用于控制大小的数值
}

interface BouncingAvatarsProps {
  avatars: AvatarData[];
  className?: string;
  speed?: number; // 控制移动速度，默认为 1，范围建议 0.5 - 3
}

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  name: string;
  avatar?: string;
  avatarImage?: HTMLImageElement;
  imageLoaded: boolean;
  isHovered: boolean;
  showShadow: boolean;
  shadowOpacity: number;
}

export default function BouncingAvatars({
  avatars,
  className = '',
  speed = 1,
}: BouncingAvatarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // 生成随机颜色
  const getRandomColor = () => {
    const colors = [
      '#f472b6', // pink-400
      '#60a5fa', // blue-400
      '#c084fc', // purple-400
      '#fb923c', // orange-400
      '#4ade80', // green-400
      '#facc15', // yellow-400
      '#f87171', // red-400
      '#a78bfa', // violet-400
      '#34d399', // emerald-400
      '#fbbf24', // amber-400
      '#fb7185', // rose-400
      '#38bdf8', // sky-400
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    updateCanvasSize();

    // 计算半径比例
    const values = avatars.map((a) => a.value || 1);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const valueRange = maxValue - minValue || 1;

    // 初始化球体
    const initBalls = () => {
      const balls: Ball[] = [];
      const padding = 20;
      const minRadius = 20;
      const maxRadius = Math.min(canvas.width, canvas.height) / 6; // 最大半径不超过容器的1/6

      avatars.forEach((avatar, index) => {
        // 根据值计算半径，按比例缩放
        const normalizedValue = (avatar.value || 1) - minValue;
        const radiusRatio = valueRange > 0 ? normalizedValue / valueRange : 0.5;
        const radius = minRadius + radiusRatio * (maxRadius - minRadius);

        // 确保不超出容器
        const effectiveRadius = Math.min(
          radius,
          (canvas.width - padding * 2) / 2,
          (canvas.height - padding * 2) / 2
        );

        // 随机位置，确保不超出边界
        const x =
          padding +
          effectiveRadius +
          Math.random() * (canvas.width - 2 * (padding + effectiveRadius));
        const y =
          padding +
          effectiveRadius +
          Math.random() * (canvas.height - 2 * (padding + effectiveRadius));

        // 随机速度
        const ballSpeed = (1 + Math.random() * 2) * speed;
        const angle = Math.random() * Math.PI * 2;

        const ball: Ball = {
          id: avatar.id,
          x,
          y,
          vx: Math.cos(angle) * ballSpeed,
          vy: Math.sin(angle) * ballSpeed,
          radius: effectiveRadius,
          color: getRandomColor(),
          name: avatar.name,
          avatar: avatar.avatar,
          imageLoaded: false,
          isHovered: false,
          showShadow: Math.random() > 0.5,
          shadowOpacity: Math.random(),
        };

        // 如果有头像地址，尝试加载图片
        if (avatar.avatar) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ball.avatarImage = img;
            ball.imageLoaded = true;
          };
          img.onerror = () => {
            ball.imageLoaded = false;
          };
          img.src = avatar.avatar;
        }

        balls.push(ball);
      });

      ballsRef.current = balls;
    };

    initBalls();

    // 随机切换阴影显示
    const shadowInterval = setInterval(() => {
      ballsRef.current.forEach((ball) => {
        if (!ball.isHovered) {
          ball.showShadow = Math.random() > 0.5;
          ball.shadowOpacity = 0.3 + Math.random() * 0.4;
        }
      });
    }, 800);

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ballsRef.current.forEach((ball) => {
        // 检测鼠标悬停
        const dx = mouseRef.current.x - ball.x;
        const dy = mouseRef.current.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        ball.isHovered = distance < ball.radius;

        // 只有在非 hover 状态下才更新位置
        if (!ball.isHovered) {
          // 更新位置
          ball.x += ball.vx;
          ball.y += ball.vy;

          // 边界碰撞检测（带弹性）
          const damping = 0.8; // 弹性系数

          if (ball.x - ball.radius < 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx) * damping;
          } else if (ball.x + ball.radius > canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx = -Math.abs(ball.vx) * damping;
          }

          if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy) * damping;
          } else if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.vy = -Math.abs(ball.vy) * damping;
          }
        }

        // 绘制阴影
        const hasShadow = ball.showShadow || ball.isHovered;
        if (hasShadow) {
          ctx.save();
          ctx.shadowColor = ball.isHovered
            ? 'rgba(59, 130, 246, 0.8)'
            : `rgba(59, 130, 246, ${ball.shadowOpacity})`;
          ctx.shadowBlur = ball.isHovered ? 40 : 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        // 绘制圆形背景
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();

        if (hasShadow) {
          ctx.restore();
        }

        // 如果有头像图片且加载成功，绘制图片
        if (ball.imageLoaded && ball.avatarImage) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(
            ball.avatarImage,
            ball.x - ball.radius,
            ball.y - ball.radius,
            ball.radius * 2,
            ball.radius * 2
          );
          ctx.restore();
        } else {
          // 没有头像或加载失败时，绘制名字首字母
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.font = `bold ${ball.radius * 0.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ball.name[0].toUpperCase(), ball.x, ball.y);
          ctx.restore();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // 鼠标移动事件
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      ballsRef.current.forEach((ball) => {
        ball.isHovered = false;
      });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // 窗口大小调整
    const handleResize = () => {
      updateCanvasSize();
      initBalls();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(shadowInterval);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [avatars, mounted, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
