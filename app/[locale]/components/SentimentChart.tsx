import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '../opinions/[opinion]/types';

interface SentimentChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    return (
      <div className="border-theme bg-surface/95 min-w-[220px] rounded-xl border p-3 shadow-xl backdrop-blur-md">
        <p className="text-textSecondary mb-2 text-xs font-medium">{label}</p>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-textPrimary text-sm">Probability</span>
          <span className="text-lg font-bold text-blue-500">{(data.price * 100).toFixed(0)}%</span>
        </div>

        {data.kols && data.kols.length > 0 && (
          <div className="border-theme mt-2 border-t pt-2">
            <p className="text-textSecondary mb-2 text-[10px] font-semibold tracking-wider uppercase">
              Key Activity
            </p>
            <div className="space-y-2.5">
              {data.kols.map((k, i) => (
                <div
                  key={i}
                  className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-2.5 duration-300"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <img
                    src={k.user.avatar}
                    className="border-theme mt-0.5 h-6 w-6 rounded-full border object-cover"
                    alt={k.user.name}
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-textPrimary text-xs font-bold">{k.user.name}</span>
                    <span
                      className={`text-[10px] font-medium ${k.side === 'YES' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {k.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const SentimentChart: React.FC<SentimentChartProps> = ({ data }) => {
  return (
    <div className="mt-4 h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#71717a"
            strokeOpacity={0.2}
            vertical={false}
          />
          <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#71717a', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.5 }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#60a5fa' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
