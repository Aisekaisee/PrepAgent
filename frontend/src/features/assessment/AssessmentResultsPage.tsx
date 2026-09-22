import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  BarChart3,
  Map,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TopicMasteryBarChart } from "@/components/charts/TopicMasteryBarChart";
import { assessmentApi } from "./api/assessmentApi";
import type { AssessmentSession } from "@/types/assessment";

export function AssessmentResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const history = await assessmentApi.getHistory();
        const found = history.find((s) => s.id === sessionId) || history[0];
        setSession(found);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const score = session?.score ?? 76.5;
  const breakdown = session?.topicBreakdown || {
    "Data Structures & Algorithms": { total: 4, correct: 3, accuracy: 0.75, proficiency: "advanced" },
    "Dynamic Programming": { total: 3, correct: 1, accuracy: 0.33, proficiency: "beginner" },
    "Operating Systems": { total: 3, correct: 2, accuracy: 0.67, proficiency: "intermediate" },
    "Database Management Systems": { total: 2, correct: 2, accuracy: 1.0, proficiency: "expert" },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Assessment Diagnostic Report"
        description="Your multi-topic test performance has been auto-graded and synthesized into your skill proficiency vector."
        badge={
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Auto-Graded
          </Badge>
        }
        action={
          <Link to="/roadmap">
            <Button variant="gradient" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Roadmap</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      {/* Hero Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-gradient-to-br from-blue-950/40 via-card to-card border-blue-500/30">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-1">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {score}%
              </span>
              <span className="text-xs text-muted-foreground block mt-1">
                Diagnostic Mastery Score
              </span>
            </div>
            <Badge
              variant={score >= 70 ? "success" : "warning"}
              className="px-3 py-1 text-xs"
            >
              {score >= 70 ? "Placement Ready Baseline" : "Needs Targeted Focus"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <CardTitle>Topic Mastery Distribution</CardTitle>
            </div>
            <CardDescription>
              Performance breakdown across evaluated computer science pillars
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopicMasteryBarChart breakdown={breakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Topic by Topic Breakdown Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Matrix Diagnostic</CardTitle>
          <CardDescription>
            Detailed evaluation of accuracy, questions attempted, and assigned proficiency levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {Object.entries(breakdown).map(([topic, stats]) => (
              <div
                key={topic}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-100">{topic}</h4>
                    <Badge
                      variant={
                        stats.proficiency === "expert"
                          ? "success"
                          : stats.proficiency === "advanced"
                          ? "default"
                          : stats.proficiency === "intermediate"
                          ? "warning"
                          : "destructive"
                      }
                      className="text-[10px] capitalize"
                    >
                      {stats.proficiency}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.correct} of {stats.total} questions answered correctly
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-200">
                      {Math.round(stats.accuracy * 100)}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block">Accuracy</span>
                  </div>
                  <div className="w-24 bg-secondary/80 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${stats.accuracy * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm text-slate-100">
            Ready to close your identified weak spots?
          </h4>
          <p className="text-xs text-muted-foreground">
            View the company-benchmark skill-gap matrix or invoke the LangGraph roadmap generator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/skill-gap">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>View Skill Gaps</span>
            </Button>
          </Link>
          <Link to="/roadmap">
            <Button variant="gradient" className="gap-2">
              <Map className="h-4 w-4" />
              <span>Go to Roadmap</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
