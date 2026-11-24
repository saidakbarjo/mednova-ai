"use client";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useI18n } from "@/i18n/client";

export const CHART = { cyan: "#06B6D4", blue: "#2563EB", navy: "#16295A", emerald: "#10B981", amber: "#F59E0B", slate: "#94A3B8", violet: "#7C3AED" };
const axis = { stroke: "#94A3B8", fontSize: 12, tickLine: false, axisLine: false } as const;
const tooltip = {
  contentStyle: { borderRadius: 12, border: "1px solid rgb(var(--line))", background: "rgb(var(--surface))", color: "rgb(var(--ink))", boxShadow: "0 8px 24px -8px rgba(11,21,48,.25)", fontSize: 12 },
  labelStyle: { color: "rgb(var(--ink))", fontWeight: 600 },
};

export function BloodPressureChart({ data, labels }: { data: { label: string; systolic?: number; diastolic?: number }[]; labels: [string, string] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="sys" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={CHART.cyan} stopOpacity={0.3} /><stop offset="1" stopColor={CHART.cyan} stopOpacity={0} /></linearGradient>
          <linearGradient id="dia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={CHART.blue} stopOpacity={0.22} /><stop offset="1" stopColor={CHART.blue} stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis domain={[60, 160]} {...axis} />
        <Tooltip {...tooltip} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="systolic" name={labels[0]} stroke={CHART.cyan} strokeWidth={2.5} fill="url(#sys)" connectNulls dot={{ r: 3 }} />
        <Area type="monotone" dataKey="diastolic" name={labels[1]} stroke={CHART.blue} strokeWidth={2.5} fill="url(#dia)" connectNulls dot={{ r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({ data, dataKey, name, color = CHART.cyan, unit, domain }: {
  data: Record<string, unknown>[]; dataKey: string; name: string; color?: string; unit?: string; domain?: [number | string, number | string];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" {...axis} />
        <YAxis domain={domain ?? ["auto", "auto"]} {...axis} unit={unit} />
        <Tooltip {...tooltip} />
        <Line type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5} connectNulls dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SimpleBars({ data, xKey, bars, height = 260, layout = "horizontal" }: {
  data: Record<string, unknown>[]; xKey: string; bars: { key: string; name: string; color: string }[]; height?: number; layout?: "horizontal" | "vertical";
}) {
  const vertical = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 10, right: 8, left: vertical ? 20 : -18, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={vertical} horizontal={!vertical} />
        {vertical ? <><XAxis type="number" {...axis} allowDecimals={false} /><YAxis type="category" dataKey={xKey} {...axis} width={110} /></>
          : <><XAxis dataKey={xKey} {...axis} /><YAxis {...axis} allowDecimals={false} /></>}
        <Tooltip {...tooltip} cursor={{ fill: "rgb(var(--subtle))" }} />
        {bars.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {bars.map((b) => <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} radius={vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={36} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

const STATUS_COLORS: Record<string, string> = { pending: CHART.amber, confirmed: CHART.cyan, completed: CHART.emerald, cancelled: CHART.slate };
export function StatusDonut({ data }: { data: { status: string; count: number }[] }) {
  const { t } = useI18n();
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data.map((d) => ({ ...d, label: t(`status.${d.status}`) }))} dataKey="count" nameKey="label" innerRadius={62} outerRadius={90} paddingAngle={3} style={{ stroke: "rgb(var(--surface))" }} strokeWidth={3}>
            {data.map((d) => <Cell key={d.status} fill={STATUS_COLORS[d.status] ?? CHART.slate} />)}
          </Pie>
          <Tooltip {...tooltip} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center"><p className="font-display text-3xl font-bold">{total}</p><p className="text-xs text-ink-muted">{t("common.total")}</p></div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d) => (
          <span key={d.status} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[d.status] }} /> {t(`status.${d.status}`)} · {d.count}
          </span>
        ))}
      </div>
    </div>
  );
}
