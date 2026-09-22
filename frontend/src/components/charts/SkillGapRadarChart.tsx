import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { GapItem } from "@/types/skillgap";

interface SkillGapRadarChartProps {
  gaps: GapItem[];
}

const levelMap = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function SkillGapRadarChart({ gaps }: SkillGapRadarChartProps) {
  const chartData = gaps.slice(0, 8).map((gap) => ({
    topic: gap.topic.length > 14 ? gap.topic.slice(0, 14) + "..." : gap.topic,
    "Your Level": levelMap[gap.currentLevel] || 1,
    "Target Level": levelMap[gap.requiredLevel] || 3,
    fullTopic: gap.topic,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
        No assessment data yet to generate radar analysis.
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="topic" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 4]}
            tickCount={5}
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              borderRadius: "0.5rem",
              color: "#f8fafc",
            }}
          />
          <Radar
            name="Your Level"
            dataKey="Your Level"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.35}
          />
          <Radar
            name="Target Level"
            dataKey="Target Level"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.25}
          />
          <Legend wrapperStyle={{ paddingTop: "10px" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
