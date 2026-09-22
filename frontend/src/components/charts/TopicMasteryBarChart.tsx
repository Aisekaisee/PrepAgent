import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TopicBreakdown } from "@/types/assessment";

interface TopicMasteryBarChartProps {
  breakdown: TopicBreakdown;
}

export function TopicMasteryBarChart({ breakdown }: TopicMasteryBarChartProps) {
  const data = Object.entries(breakdown).map(([topic, stats]) => ({
    topic: topic.length > 12 ? topic.slice(0, 12) + "..." : topic,
    fullTopic: topic,
    accuracy: Math.round(stats.accuracy * 100),
    correct: stats.correct,
    total: stats.total,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        Complete an assessment to view topic mastery breakdown.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.6} />
          <XAxis
            dataKey="topic"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
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
            formatter={(value: unknown) => [`${value}% Accuracy`, "Mastery"]}
            labelFormatter={(_, payload) =>
              payload[0]?.payload?.fullTopic || ""
            }
          />
          <Bar
            dataKey="accuracy"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
            name="Accuracy"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
