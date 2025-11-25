'use client';
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@shadcn/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { ChartConfig, ChartContainer } from '@shadcn/components/ui/chart';

interface ChartDataPoint {
  date: string;
  yes: number;
  no: number;
  yesUsers?: Array<{ avatar: string; address: string }>;
  noUsers?: Array<{ avatar: string; address: string }>;
}

interface OpinionChartProps {
  data?: ChartDataPoint[] | null;
}

// 模拟数据格式示例
const mockData: ChartDataPoint[] = [
  { date: 'Oct 12', yes: 27, no: 15 },
  { date: 'Oct 13', yes: 25, no: 14 },
  { date: 'Oct 14', yes: 22, no: 13 },
  { date: 'Oct 15', yes: 18, no: 12 },
  {
    date: 'Oct 16',
    yes: 15,
    no: 11,
    yesUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', address: '0x1234...5678' },
    ],
    noUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', address: '0xabcd...efgh' },
    ],
  },
  {
    date: 'Oct 17',
    yes: 12,
    no: 10,
    yesUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', address: '0x1111...2222' },
    ],
    noUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', address: '0x3333...4444' },
    ],
  },
  {
    date: 'Oct 18',
    yes: 8,
    no: 9,
    yesUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', address: '0x5555...6666' },
    ],
    noUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', address: '0x7777...8888' },
    ],
  },
  {
    date: 'Oct 19',
    yes: 5,
    no: 7,
    yesUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', address: '0x9999...aaaa' },
    ],
    noUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', address: '0xbbbb...cccc' },
    ],
  },
  { date: 'Oct 20', yes: 2, no: 5 },
  { date: 'Oct 21', yes: 0, no: 3 },
  { date: 'Oct 22', yes: 2, no: 2 },
  { date: 'Oct 23', yes: 1, no: 3 },
  { date: 'Oct 24', yes: 5, no: 4 },
  { date: 'Oct 25', yes: 8, no: 5 },
  {
    date: 'Oct 26',
    yes: 12,
    no: 6,
    yesUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=26', address: '0x26...26' },
    ],
    noUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=262', address: '0x262...262' },
    ],
  },
  {
    date: 'Oct 27',
    yes: 18,
    no: 7,
    yesUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=27', address: '0x27...27' },
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=272', address: '0x272...272' },
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=272', address: '0x272...273' },
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=272', address: '0x272...274' },
    ],
    noUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=273', address: '0x273...273' },
    ],
  },
  {
    date: 'Oct 28',
    yes: 22,
    no: 8,
    yesUsers: [
      { avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=28', address: '0x28...28' },
    ],
  },
  { date: 'Oct 29', yes: 28, no: 9 },
  { date: 'Oct 30', yes: 32, no: 10 },
  { date: 'Oct 31', yes: 35, no: 11 },
  { date: 'Nov 1', yes: 36, no: 12 },
  { date: 'Nov 2', yes: 37, no: 12 },
];

const chartConfig = {
  yes: {
    label: 'YES',
    color: '#22c55e', // 绿色
  },
  no: {
    label: 'NO',
    color: '#ef4444', // 红色
  },
} satisfies ChartConfig;

export default function OpinionChart({ data }: OpinionChartProps) {
  // 如果提供了数据，使用提供的数据；否则使用模拟数据
  const chartData = data && data.length > 0 ? data : mockData;
  const [hoveredLine, setHoveredLine] = useState<'yes' | 'no' | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<{
    date: string;
    users: Array<{ avatar: string; address: string }>;
    lineType: 'yes' | 'no';
  } | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 根据当前悬停的线更新显示的用户
  const updateSelectedPointByLine = useCallback(
    (date: string) => {
      const payload = chartData.find((d) => d.date === date);
      if (!payload) return;

      const hasYesUsers = payload.yesUsers && payload.yesUsers.length > 0;
      const hasNoUsers = payload.noUsers && payload.noUsers.length > 0;

      // 只根据当前悬停的线来显示用户
      if (hoveredLine === 'yes' && hasYesUsers && payload.yesUsers) {
        setSelectedPoint({
          date: payload.date,
          users: payload.yesUsers,
          lineType: 'yes',
        });
      } else if (hoveredLine === 'no' && hasNoUsers && payload.noUsers) {
        setSelectedPoint({
          date: payload.date,
          users: payload.noUsers,
          lineType: 'no',
        });
      } else {
        setSelectedPoint(null);
      }
    },
    [chartData, hoveredLine]
  );

  // 自定义Cursor组件，显示虚线坐标
  const CustomCursor = useCallback(
    ({ active, payload, coordinate, height, width, ...props }: any) => {
      if (!active || !coordinate || !payload || payload.length === 0) return null;

      const { x } = coordinate;
      const viewBox = props.viewBox || { height: height || 320, width: width || 600 };
      const chartHeight = viewBox.height || height || 320;
      const chartWidth = viewBox.width || width || 600;
      const marginTop = 20;
      const marginBottom = 20;
      const marginLeft = 10;
      const marginRight = 20;
      const plotHeight = chartHeight - marginTop - marginBottom;
      const plotBottom = chartHeight - marginBottom;
      const plotRight = chartWidth - marginRight;

      const yesPayload = payload.find((p: any) => p.dataKey === 'yes');
      const noPayload = payload.find((p: any) => p.dataKey === 'no');

      if (!yesPayload || !noPayload || !yesPayload.payload || !noPayload.payload) return null;

      const maxValue = Math.max(...chartData.map((d) => Math.max(d.yes, d.no)));
      const minValue = Math.min(...chartData.map((d) => Math.min(d.yes, d.no)));
      const valueRange = maxValue - minValue || 1;

      const calculateY = (value: number) => {
        const percent = 1 - (value - minValue) / valueRange;
        return marginTop + plotHeight * percent;
      };

      const yesY = calculateY(yesPayload.payload.yes);
      const noY = calculateY(noPayload.payload.no);

  return (
        <g>
          {/* 垂直虚线 - 从坐标点到X轴 */}
          <line
            x1={x}
            y1={marginTop}
            x2={x}
            y2={plotBottom}
            stroke="#888"
            strokeWidth={1}
            strokeDasharray="5 5"
            opacity={0.5}
          />
          {/* 水平虚线 - YES线 (从数据点到右边Y轴) */}
          <line
            x1={x}
            y1={yesY}
            x2={plotRight}
            y2={yesY}
            stroke={chartConfig.yes.color}
            strokeWidth={1}
            strokeDasharray="5 5"
            opacity={0.5}
          />
          {/* 水平虚线 - NO线 (从数据点到右边Y轴) */}
          <line
            x1={x}
            y1={noY}
            x2={plotRight}
            y2={noY}
            stroke={chartConfig.no.color}
            strokeWidth={1}
            strokeDasharray="5 5"
            opacity={0.5}
          />
        </g>
      );
    },
    [chartData]
  );

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    // 当tooltip激活时，根据当前悬停的线显示对应的用户
    React.useEffect(() => {
      if (active && label) {
        if (hoveredLine) {
          updateSelectedPointByLine(label);
        } else {
          // 如果没有悬停在线上，检查当前点是否有用户数据
          const dataPoint = chartData.find((d) => d.date === label);
          if (!dataPoint || (!dataPoint.yesUsers?.length && !dataPoint.noUsers?.length)) {
            // 如果当前点没有用户数据，清除选中状态
            setSelectedPoint(null);
          }
        }
      } else if (!active) {
        // tooltip不激活时，如果没有悬停在线上，清除选中状态
        if (!hoveredLine) {
          setSelectedPoint(null);
        }
      }
    }, [active, hoveredLine, label]);

    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-background border-border/50 rounded-lg border px-2 py-2 shadow-lg">
        <p className="mb-1 text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === 'yes' ? 'YES' : 'NO'}: {entry.value}%
          </p>
        ))}
      </div>
    );
  };

  // 自定义头像标签组件
  const AvatarLabel = ({ viewBox, users, lineType }: any) => {

    if (!viewBox || !viewBox.x) {
      return null;
    }

    const { x } = viewBox;
    const borderColor = lineType === 'yes' ? chartConfig.yes.color : chartConfig.no.color;
    
    // 最多显示5个头像
    const maxDisplay = 5;
    const displayUsers = users.slice(0, maxDisplay);
    const overlapOffset = 20; // 每个头像错开20px
    // 计算起始位置，使整个头像组居中对齐虚线
    const centerIndex = (displayUsers.length - 1) / 2;
    const startX = x - centerIndex * overlapOffset;

    return (
      <g>
        {displayUsers.map((user: any, index: number) => {
          const xOffset = startX + index * overlapOffset;
          return (
            <g key={index}>
              <circle
                cx={xOffset}
                cy={20}
                r={15}
                fill="hsl(var(--background))"
                stroke={borderColor}
                strokeWidth={2}
              />
              <foreignObject x={xOffset - 15} y={5} width={30} height={30}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundImage: `url(${user.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#ccc',
                  }}
                />
              </foreignObject>
            </g>
          );
        })}
        {users.length > maxDisplay && (
          <g>
            <circle
              cx={startX + maxDisplay * overlapOffset}
              cy={20}
              r={15}
              fill="hsl(var(--muted))"
              stroke={borderColor}
              strokeWidth={2}
            />
            <text
              x={startX + maxDisplay * overlapOffset}
              y={24}
              textAnchor="middle"
              fontSize={12}
              fill="hsl(var(--foreground))"
            >
              +{users.length - maxDisplay}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <Card className="p-0 shadow-none">
      <CardContent className="p-0 sm:px-6">
        <div 
          className="relative h-64 w-full sm:h-80"
          onMouseLeave={() => {
            // 当鼠标离开图表区域时，清除所有悬停状态
            setHoveredLine(null);
            setSelectedPoint(null);
          }}
        >
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 40, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={true} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />

                {/* YES 线 */}
                <Line
                  type="monotone"
                  dataKey="yes"
                  name="YES"
                  stroke={chartConfig.yes.color}
                  strokeWidth={1}
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    const hasUsers = payload.yesUsers?.length > 0 || payload.noUsers?.length > 0;
                    if (hasUsers) {
                      return (
                        <g>
                          {/* 透明的大热区用于触发hover */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={12}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => {
                              setHoveredLine('yes');
                              if (payload.yesUsers?.length > 0) {
                                setSelectedPoint({
                                  date: payload.date,
                                  users: payload.yesUsers,
                                  lineType: 'yes',
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredLine(null);
                              setSelectedPoint(null);
                            }}
                          />
                          {/* 可见的小圆点 */}
                          {/* <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={chartConfig.yes.color}
                            stroke="#fff"
                            strokeWidth={2}
                            pointerEvents="none"
                          /> */}
                        </g>
                      );
                    }
                    return <></>;
                  }}
                  activeDot={{ r: 4, fill: chartConfig.yes.color }}
                  opacity={hoveredLine === 'no' ? 0.2 : 1}
                  style={{
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                  onMouseOver={() => {
                    setHoveredLine('yes');
                  }}
                  onMouseOut={() => {
                    setHoveredLine(null);
                    setSelectedPoint(null);
                  }}
                />

                {/* NO 线 */}
                <Line
                  type="monotone"
                  dataKey="no"
                  name="NO"
                  stroke={chartConfig.no.color}
                  strokeWidth={1}
                  dot={(props: any) => {
                    const { cx, cy, payload, index } = props;
                    const hasUsers = payload.yesUsers?.length > 0 || payload.noUsers?.length > 0;
                    if (hasUsers) {
                      return (
                        <g>
                          {/* 透明的大热区用于触发hover */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={12}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => {
                              setHoveredLine('no');
                              if (payload.noUsers?.length > 0) {
                                setSelectedPoint({
                                  date: payload.date,
                                  users: payload.noUsers,
                                  lineType: 'no',
                                });
                              }
                            }}
                            onMouseLeave={() => {
                              setHoveredLine(null);
                              setSelectedPoint(null);
                            }}
                          />
                          {/* 可见的小圆点 */}
                          {/* <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={chartConfig.no.color}
                            stroke="#fff"
                            strokeWidth={2}
                            pointerEvents="none"
                          /> */}
                        </g>
                      );
                    }
                    return <></>;
                  }}
                  activeDot={{ r: 4, fill: chartConfig.no.color }}
                  opacity={hoveredLine === 'yes' ? 0.2 : 1}
                  style={{
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                  onMouseOver={() => {
                    setHoveredLine('no');
                  }}
                  onMouseOut={() => {
                    setHoveredLine(null);
                    setSelectedPoint(null);
                  }}
                />

                {/* 显示选中点的虚线和头像 */}
                {(() => {
                  if (selectedPoint && selectedPoint.users.length > 0) {
                    return (
                      <ReferenceLine
                        x={selectedPoint.date}
                        stroke={
                          selectedPoint.lineType === 'yes'
                            ? chartConfig.yes.color
                            : chartConfig.no.color
                        }
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={
                          <AvatarLabel
                            users={selectedPoint.users}
                            lineType={selectedPoint.lineType}
                          />
                        }
                        ifOverflow="extendDomain"
                      />
                    );
                  }
                  return null;
                })()}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
    </div>
      </CardContent>
    </Card>
  );
}
