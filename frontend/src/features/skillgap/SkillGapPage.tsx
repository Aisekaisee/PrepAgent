import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  Building2,
  ArrowRight,
  TrendingDown,
  Sparkles,
  BookOpen,
  Filter,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillGapRadarChart } from "@/components/charts/SkillGapRadarChart";
import { skillGapApi } from "./api/skillGapApi";
import type { GapItem } from "@/types/skillgap";

export function SkillGapPage() {
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await skillGapApi.getGapAnalysis();
        setGaps(data.gaps);
        setTargetCompanies(data.targetCompanies);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredGaps =
    selectedCompanyFilter === "all"
      ? gaps
      : gaps.filter((g) => g.relevantCompanies.includes(selectedCompanyFilter));

  const criticalGapsCount = gaps.filter(
    (g) => g.severity === "critical" || g.severity === "high"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Skill-Gap Matrix & Benchmarks"
        description="Detailed comparison between your verified diagnostic proficiency and the minimum hiring thresholds of your target companies."
        action={
          <Link to="/roadmap">
            <Button variant="gradient" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Generate Roadmap from Gaps</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block">
                {targetCompanies.length}
              </span>
              <span className="text-xs text-muted-foreground">Target Companies Tracked</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-rose-500/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-rose-400 block">
                {criticalGapsCount} Topics
              </span>
              <span className="text-xs text-muted-foreground">High / Critical Skill Gaps</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-blue-400 block">
                {gaps.length} Total
              </span>
              <span className="text-xs text-muted-foreground">Technical Pillars Evaluated</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart & Benchmark Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Proficiency Radar vs. Hiring Bar</CardTitle>
                <CardDescription>
                  Blue area = Your current level; Purple line = Target hiring expectation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SkillGapRadarChart gaps={gaps} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <CardTitle>AI Synthesis Insights</CardTitle>
            </div>
            <CardDescription>
              Autonomous diagnostic report synthesized from your test history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-muted-foreground">
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-slate-300 space-y-1">
              <span className="font-semibold text-rose-300 block flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4" /> Priority 1: Dynamic Programming
              </span>
              <p className="text-[11px] leading-relaxed">
                Currently assessed at Beginner while Google & Uber expect Expert problem solving in multi-state DP. Focus on 2D DP grids and 0/1 Knapsack patterns.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-slate-300 space-y-1">
              <span className="font-semibold text-amber-300 block flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Priority 2: System Design
              </span>
              <p className="text-[11px] leading-relaxed">
                Intermediate proficiency detected. Review distributed caching (Redis clusters), message streaming (Kafka), and database sharding patterns.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 text-slate-300 space-y-1">
              <span className="font-semibold text-emerald-300 block flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Strong Foundation: DBMS & SQL
              </span>
              <p className="text-[11px] leading-relaxed">
                Your Database internals and transaction isolation scores match Amazon's expected level. No high-priority remediation required.
              </p>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            <Link to="/roadmap">
              <Button variant="gradient" className="w-full gap-2">
                <span>Convert Gaps to 8-Week Roadmap</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Filter by target company tabs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Filter By Target Company:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCompanyFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                selectedCompanyFilter === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-secondary/60 text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              All Benchmarks
            </button>
            {targetCompanies.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCompanyFilter(c)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  selectedCompanyFilter === c
                    ? "bg-purple-600 text-white border-purple-500"
                    : "bg-secondary/60 text-muted-foreground border-border/60 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Ranked Gaps Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ranked Skill Gaps (Severity Order)</CardTitle>
            <CardDescription>
              Ranked from most critical deficit to topics that are already on track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground pb-2">
                    <th className="py-3 px-2 font-medium">Rank</th>
                    <th className="py-3 px-3 font-medium">Topic</th>
                    <th className="py-3 px-3 font-medium">Your Level</th>
                    <th className="py-3 px-3 font-medium">Target Level</th>
                    <th className="py-3 px-3 font-medium">Severity</th>
                    <th className="py-3 px-3 font-medium">Relevant Companies</th>
                    <th className="py-3 px-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredGaps.map((gap) => (
                    <tr key={gap.topic} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3.5 px-2 font-mono text-muted-foreground">
                        #{gap.rank}
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-100">
                        {gap.topic}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {gap.currentLevel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant="secondary" className="capitalize text-[10px]">
                          {gap.requiredLevel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            gap.severity === "critical"
                              ? "destructive"
                              : gap.severity === "high"
                              ? "warning"
                              : gap.severity === "moderate"
                              ? "purple"
                              : "success"
                          }
                          className="capitalize text-[10px]"
                        >
                          {gap.severity}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-muted-foreground">
                        {gap.relevantCompanies.join(", ")}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <Link to={`/resources?topic=${encodeURIComponent(gap.topic)}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-blue-400">
                            <BookOpen className="h-3 w-3" />
                            <span>Practice</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
