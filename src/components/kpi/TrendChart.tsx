import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/data/types";

export function TrendChart({ data, height = 240 }: { data: TrendPoint[]; height?: number }) {
  const series = data.map((p) => ({
    ...p,
    label: new Date(p.t).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis domain={[40, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
        <Line type="monotone" dataKey="oee" stroke="var(--primary)" strokeWidth={2.5} dot={false} name="OEE" />
        <Line type="monotone" dataKey="availability" stroke="var(--info)" strokeWidth={1.5} dot={false} name="Availability" />
        <Line type="monotone" dataKey="performance" stroke="var(--warning)" strokeWidth={1.5} dot={false} name="Performance" />
        <Line type="monotone" dataKey="quality" stroke="var(--success)" strokeWidth={1.5} dot={false} name="Quality" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MiniSpark({ data, dataKey = "oee" }: { data: TrendPoint[]; dataKey?: keyof TrendPoint }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey as string}
          stroke="var(--primary)"
          strokeWidth={1.5}
          fill={`url(#spark-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
