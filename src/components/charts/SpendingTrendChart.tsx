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
import { formatCurrency } from '../../utils/formatters';

interface SpendingDayPoint {
  day: string;
  date: string;
  amount: number;
  cumulative: number;
}

interface SpendingTrendChartProps {
  data: SpendingDayPoint[];
  currencyCode: string;
  isDark?: boolean;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  data,
  currencyCode,
  isDark = false,
}) => {
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="day"
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }}
          />
          <YAxis
            stroke={textColor}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatCurrency(val, currencyCode, { compact: true })}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const pt = payload[0].payload as SpendingDayPoint;
                return (
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{pt.date}</p>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-slate-500">Day Spend:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(pt.amount, currencyCode)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          Month to Date:
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(pt.cumulative, currencyCode)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            name="Cumulative Spend"
            stroke="#6366f1"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#spendingGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
