import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface IncomeExpenseChartProps {
  data: IncomeExpenseData[];
  currencyCode: string;
  isDark?: boolean;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  data,
  currencyCode,
  isDark = false,
}) => {
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="month"
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
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const inc = Number(payload[0]?.value || 0);
                const exp = Number(payload[1]?.value || 0);
                const net = inc - exp;
                return (
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Income:
                        </span>
                        <span className="font-semibold">{formatCurrency(inc, currencyCode)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-rose-500">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Expenses:
                        </span>
                        <span className="font-semibold">{formatCurrency(exp, currencyCode)}</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 font-medium">
                        <span className="text-slate-500">Net Savings:</span>
                        <span className={net >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                          {formatCurrency(net, currencyCode, { sign: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 capitalize">
                {value}
              </span>
            )}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            name="Expenses"
            dataKey="expenses"
            fill="#f43f5e"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
