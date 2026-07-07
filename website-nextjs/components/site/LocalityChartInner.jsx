'use client'
// Inner chart — only loaded lazily via dynamic() in LocalityChart.jsx
// Keeps recharts out of the initial JS bundle
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function LocalityChartInner({ chartData = [] }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold sm:text-xl">Starting price by locality</h3>
          <p className="mt-1 text-xs text-muted-foreground">Indicative price (₹ Lakh) for entry-level homes • dynamic data</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> ₹ Lakh
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary/30" /> 4-yr growth %
          </span>
        </div>
      </div>

      <div className="mt-5 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: 'color-mix(in oklab, var(--accent) 50%, transparent)' }}
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--popover-foreground)',
              }}
              formatter={(v, _n, item) => {
                const key = item?.dataKey;
                return key === 'price' ? [`₹${v} L`, 'Starting price'] : [`${v}%`, '4-yr growth'];
              }}
            />
            <Bar dataKey="price" radius={[8, 8, 0, 0]} barSize={22}>
              {chartData.map((_, i) => (
                <Cell key={i} fill="var(--primary)" />
              ))}
            </Bar>
            <Bar dataKey="growth" radius={[8, 8, 0, 0]} barSize={22} fill="color-mix(in oklab, var(--primary) 35%, transparent)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
