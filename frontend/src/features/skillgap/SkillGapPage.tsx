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
  Play,
  RotateCcw,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillGapRadarChart } from "@/components/charts/SkillGapRadarChart";
import { skillGapApi } from "./api/skillGapApi";
import type { GapItem, SkillGapInsights } from "@/types/skillgap";

export function SkillGapPage() {
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [insights, setInsights] = useState<SkillGapInsights | undefined>(undefined);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await skillGapApi.getGapAnalysis();
        setGaps(Array.isArray(data.gaps) ? data.gaps : []);
        setTargetCompanies(Array.isArray(data.targetCompanies) ? data.targetCompanies : []);
        setInsights(data.insights);
      } catch (err) {
        console.error("Failed to load skill gaps:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const safeGaps = Array.isArray(gaps) ? gaps : [];
  const safeTargetCompanies = Array.isArray(targetCompanies) ? targetCompanies : [];

  const filteredGaps =
    selectedCompanyFilter === "all"
      ? safeGaps
      : safeGaps.filter((g) => (g.relevantCompanies || []).includes(selectedCompanyFilter));

  const criticalGapsCount = safeGaps.filter(
    (g) => g.severity === "critical" || g.severity === "high"
  ).length;

  const assessedCount = safeGaps.filter((g) => g.isAssessed).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <span className="text-sm font-medium text-slate-300">
          Synthesizing assessment performance against company hiring benchmarks...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Skill-Gap Matrix & Benchmarks"
        description="Dynamic comparison between your verified diagnostic assessment performance and the hiring thresholds of your target companies."
        badge={
          <Badge variant="purple" className="gap-1">
            <Sparkles className="h-3 w-3" /> Assessment Synchronized
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Link to="/assessments">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Play className="h-3.5 w-3.5" />
                <span>Take Diagnostic</span>
              </Button>
            </Link>
            <Link to="/roadmap">
              <Button variant="gradient" size="sm" className="gap-1.5 text-xs shadow-md shadow-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate AI Roadmap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block">
                {safeTargetCompanies.length}
              </span>
              <span className="text-xs text-muted-foreground">Target Companies</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-rose-500/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-rose-400 block">
                {criticalGapsCount} Topics
              </span>
              <span className="text-xs text-muted-foreground">High / Critical Deficits</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-emerald-500/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-400 block">
                {assessedCount} / {safeGaps.length}
              </span>
              <span className="text-xs text-muted-foreground">Assessed Pillars</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-blue-400 block">
                {safeGaps.length} Total
              </span>
              <span className="text-xs text-muted-foreground">Benchmark Pillars</span>
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
                <CardTitle>Proficiency Radar vs. Target Bar</CardTitle>
                <CardDescription>
                  Blue area = Your current assessed level; Purple line = Target hiring expectation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SkillGapRadarChart gaps={safeGaps} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              <CardTitle>Dynamic Assessment Insights</CardTitle>
            </div>
            <CardDescription>
              Autonomous synthesis generated from your assessment performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-muted-foreground">
            {insights?.priority1 ? (
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-rose-500/30 text-slate-300 space-y-1">
                <span className="font-semibold text-rose-300 block flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4" /> Priority 1: {insights.priority1.topic}
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {insights.priority1.description}
                </p>
              </div>
            ) : null}

            {insights?.priority2 ? (
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-amber-500/30 text-slate-300 space-y-1">
                <span className="font-semibold text-amber-300 block flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Priority 2: {insights.priority2.topic}
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {insights.priority2.description}
                </p>
              </div>
            ) : null}

            {insights?.strongFoundation ? (
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-emerald-500/30 text-slate-300 space-y-1">
                <span className="font-semibold text-emerald-300 block flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Strong Foundation: {insights.strongFoundation.topic}
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {insights.strongFoundation.description}
                </p>
              </div>
            ) : null}

            {!insights?.priority1 && !insights?.priority2 && !insights?.strongFoundation && (
              <div className="p-4 rounded-xl bg-secondary/30 text-center text-xs text-muted-foreground">
                Take an assessment diagnostic to generate targeted AI insights for your target companies.
              </div>
            )}
          </CardContent>
          <div className="p-6 pt-0">
            <Link to="/roadmap">
              <Button variant="gradient" className="w-full gap-2">
                <span>Convert Gaps to Adaptive Roadmap</span>
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
            {safeTargetCompanies.map((c) => (
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
              Real gap calculation: Target company expectation minus your current verified diagnostic level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredGaps.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No skill gaps found matching the selected filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground pb-2">
                      <th className="py-3 px-2 font-medium">Rank</th>
                      <th className="py-3 px-3 font-medium">Topic Pillar</th>
                      <th className="py-3 px-3 font-medium">Your Level</th>
                      <th className="py-3 px-3 font-medium">Target Level</th>
                      <th className="py-3 px-3 font-medium">Severity</th>
                      <th className="py-3 px-3 font-medium">Relevant Target Companies</th>
                      <th className="py-3 px-2 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredGaps.map((gap) => (
                      <tr key={gap.topic} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3.5 px-2 font-mono text-muted-foreground">
                          #{gap.rank}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-slate-100 block">
                            {gap.topic}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {gap.isAssessed ? (
                              <span className="text-emerald-400 font-medium">
                                Assessed via diagnostics ✓
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Baseline (unassessed)
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={gap.isAssessed ? "default" : "outline"}
                            className="capitalize text-[10px]"
                          >
                            {gap.currentLevel || "beginner"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge variant="secondary" className="capitalize text-[10px]">
                            {gap.requiredLevel || "intermediate"}
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
                            {gap.severity || "moderate"}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-3 text-muted-foreground font-medium">
                          {(gap.relevantCompanies || []).join(", ") || "Target Benchmark"}
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/resources?topic=${encodeURIComponent(gap.topic)}`}>
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-blue-400">
                                <BookOpen className="h-3 w-3" />
                                <span>Resources</span>
                              </Button>
                            </Link>
                            <Link to="/assessments">
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-purple-300">
                                <Play className="h-3 w-3" />
                                <span>{gap.isAssessed ? "Retest" : "Assess"}</span>
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
