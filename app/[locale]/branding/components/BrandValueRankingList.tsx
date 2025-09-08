import Image from 'next/image';
import { CartesianGrid, Line, LineChart } from 'recharts';
import clsx from 'clsx';

import { TableCell, TableRow } from '@shadcn-ui/table';
import { ChartContainer, ChartConfig } from '@shadcn-ui/chart';

import { formatMoney } from '@libs/utils';
import { IBrandingValueRanking } from '@hooks/branding';

const chartConfig = {
  value: {
    label: 'Price',
    color: 'var(--color-chart-2)',
  },
} satisfies ChartConfig;

export default function BrandValueRankingList(props: { data: IBrandingValueRanking }) {
  const { data } = props;

  return data.data.map((item, index) => {
    return (
      <TableRow className="border-border border-b" key={index}>
        <TableCell>
          <div className="flex items-center justify-start gap-2 pl-4">
            <div className="size-10 overflow-hidden rounded-full">
              <Image
                src=""
                overrideSrc={item.icon}
                alt="avatar"
                className="size-full"
                width={40}
                height={40}
              />
            </div>
            <span className="truncate font-medium">{item.project_name}</span>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <span className="font-medium">${item.brand_value}</span>
        </TableCell>
        <TableCell className="text-center">
          <span
            className={clsx(
              'font-medium',
              item.volume_24h >= 0 ? 'text-[#01D07E]' : 'text-[#EF1F1F]'
            )}
          >
            {item.volume_24h >= 0 ? '+' + item.volume_24h.toFixed(2) : item.volume_24h.toFixed(2)}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <span
            className={clsx(
              'font-medium',
              item.sentiment >= 0 ? 'text-[#01D07E]' : 'text-[#EF1F1F]'
            )}
          >
            {item.sentiment >= 0 ? '+' + item.sentiment.toFixed(2) : item.sentiment.toFixed(2)}
          </span>
        </TableCell>
        <TableCell className="text-center">
          <span className="tfont-medium">{formatMoney(item.market_cap)}</span>
        </TableCell>
        <TableCell className="text-center">
          <span className="font-medium">{formatMoney(item.price)}</span>
        </TableCell>
        <TableCell>
          <div className="flex h-12.5 w-full items-center justify-center">
            <ChartContainer config={chartConfig} className="h-12.5 w-12.5">
              <LineChart
                accessibilityLayer
                data={item.last_7_day.map((item) => {
                  return { value: item };
                })}
              >
                <CartesianGrid horizontal={false} vertical={false} />
                {/* <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /> */}
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="var(--color-value)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </TableCell>
      </TableRow>
    );
  });
}
