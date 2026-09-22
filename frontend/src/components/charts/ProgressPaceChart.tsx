import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressPaceChartProps {
  data?: Array<{ week: string; planned: number; completed: number }>;
}

const defaultData = [
  { week: "Wk 1", planned: 12, completed: 14 },
  { week: "Wk 2", planned: 25, completed: 28 },
  { week: "Wk 3", planned: 38, completed: 42 },
  { week: "Wk 4", planned: 50, completed: 51 },
  { week: "Wk 5", planned: 63, completed: 60 },
  { week: "Wk 6", planned: 75, completed: 68 },
  { week: "Wk 7", planned: 88, completed: 78 },
  { week: "Wk 8", planned: 100, completed: 85 },
];

export function ProgressPaceChart({ data = defaultData }: ProgressPaceChartProps) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
          <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 10 }}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.5rem",
              color: "#f8fafc",
            }}
            formatter={(value: any, name: any) => [
              `${value}%`,
              name === "completed" ? "Actual Completed" : "Planned Target",
            ]}
          />
          <Area
            type="monotone"
            dataKey="planned"
            stroke="#64748b"
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#plannedGrad)"
            name="Planned"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#completedGrad)"
            name="Completed"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
