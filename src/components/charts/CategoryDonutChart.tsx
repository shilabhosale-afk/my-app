import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface CategoryDonutData {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
  count: number;
}

interface CategoryDonutChartProps {
  data: CategoryDonutData[];
  currencyCode: string;
  isDark?: boolean;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  currencyCode,
  isDark = false,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalExpense = data.reduce((sum, item) => sum + item.amount, 0);

  if (!data || data.length === 0 || totalExpense === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          No expense transactions recorded for this period.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Add an expense to view your category spending distribution.
        </p>
      </div>
    );
  }

  const activeItem = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Donut graphic */}
      <div className="md:col-span-6 relative h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="amount"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={isDark ? '#0f172a' : '#ffffff'}
                  strokeWidth={2}
                  className="transition-all duration-200 cursor-pointer outline-hidden"
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1) drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                    transform: activeIndex === index ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: 'center center',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryDonutData;
                  return (
                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.name}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(item.amount, currencyCode)}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.percentage}% of total expenses ({item.count} items)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
            {activeItem ? activeItem.name : 'Total Spent'}
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            {formatCurrency(activeItem ? activeItem.amount : totalExpense, currencyCode)}
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {activeItem ? `${activeItem.percentage}% of total` : `${data.length} categories`}
          </span>
        </div>
      </div>

      {/* Category breakdown list */}
      <div className="md:col-span-6 space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {data.map((item, index) => {
          const isHovered = activeIndex === index;
          return (
            <div
              key={item.id}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800/80 shadow-xs'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                  }}
                >
                  <CategoryIcon name={item.icon} className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.amount, currencyCode)}
                </p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
