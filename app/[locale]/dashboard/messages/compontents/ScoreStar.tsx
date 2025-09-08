import React, { useState, useEffect } from 'react';
import '@assets/scss/score-star.scss';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { rateKOL } from '@libs/request';

interface ScoreStarProps {
  orderId?: string;
  score?: number;
  onRateSuccess?: (newScore: string) => void;
}

export default function ScoreStar({ orderId, score, onRateSuccess }: ScoreStarProps) {
  const t = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [rated, setRated] = useState(false);
  const [selectedScore, setSelectedScore] = useState<string | null>(null);
  const [hoveredScore, setHoveredScore] = useState<string | null>(null);

  // 初始化组件时设置loading状态
  useEffect(() => {
    // 短暂延迟后关闭初始loading状态
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 当传入score时，将其设置为选中的分数
  useEffect(() => {
    if (score !== undefined && score > 0) {
      setSelectedScore(score.toString());
      setRated(true); // 设置为已评分状态，禁用交互
      setLoading(false); // 确保关闭loading状态
    }
  }, [score]);

  const handleRate = async (score: string) => {
    console.log('点击评分:', score, '订单ID:', orderId);
    if (!orderId) {
      toast.error(t('order_id_not_exist'));
      return;
    }

    if (loading || rated) return;

    setSelectedScore(score);

    try {
      setLoading(true);
      const params = {
        order_item_id: orderId,
        score,
      };
      console.log('发送评分请求:', params);
      const res: any = await rateKOL(params);
      console.log('评分响应:', res);

      if (res.code === 200) {
        toast.success(t('rate_success'));
        setRated(true);
        // 通知父组件评分成功
        if (onRateSuccess) {
          onRateSuccess(score);
        }
      } else {
        toast.error(res.msg || t('rate_failed'));
      }
    } catch (error) {
      console.error('评分出错:', error);
      toast.error(t('rate_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (loading || rated) return;

    // 计算鼠标在星星上的位置
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const halfStar = x < rect.width / 2;

    // 设置当前悬停的分数
    const score = halfStar ? (starIndex + 0.5).toString() : (starIndex + 1).toString();
    setHoveredScore(score);
  };

  const handleMouseLeave = () => {
    if (loading || rated) return;
    setHoveredScore(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (loading || rated) return;

    // 计算鼠标在星星上的位置
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const halfStar = x < rect.width / 2;

    // 设置评分
    const score = halfStar ? (starIndex + 0.5).toString() : (starIndex + 1).toString();
    handleRate(score);
  };

  // 判断星星应该显示的状态
  const getStarFill = (starIndex: number) => {
    const currentScore = parseFloat(hoveredScore || selectedScore || '0');

    if (starIndex + 0.5 <= currentScore && currentScore < starIndex + 1) {
      return 'half'; // 半星
    } else if (starIndex < currentScore) {
      return 'full'; // 整星
    } else {
      return 'empty'; // 空星
    }
  };

  return (
    <div className="rating-container">
      <div className="stars">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`star ${getStarFill(index)} ${loading ? 'loading' : ''}`}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(e, index)}
            style={{
              cursor: loading || rated ? 'default' : 'pointer',
              pointerEvents: score !== undefined && score > 0 ? 'none' : 'auto',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
              <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"></path>
            </svg>
          </div>
        ))}
      </div>
      {selectedScore && (
        <div className="selected-score">
          {t('score')}: {selectedScore}
        </div>
      )}
    </div>
  );
}
