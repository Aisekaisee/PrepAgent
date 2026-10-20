import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  BarChart3,
  Map,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Loader2,
  Building2,
  HelpCircle,
  RotateCcw,
  Code2,
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!sessionId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await assessmentApi.getSession(sessionId);
        setSession(data);
      } catch (err: any) {
        console.error("Failed to load assessment session:", err);
        setError("Unable to load assessment report. Please verify session ID.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <span className="text-sm font-medium text-slate-300">
          Compiling dynamic diagnostic report and mastery analytics...
        </span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto p-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-destructive/15 text-destructive mx-auto flex items-center justify-center">
          <XCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Assessment Report Unavailable</h3>
        <p className="text-xs text-muted-foreground">
          {error || "The requested assessment session could not be retrieved."}
        </p>
        <Link to="/assessments">
          <Button variant="outline" size="sm" className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Return to Assessment Engine</span>
          </Button>
        </Link>
      </div>
    );
  }

  // Real calculated score and topic breakdown
  const score =
    session.score !== null && session.score !== undefined
      ? Number(session.score)
      : 0;

  const breakdown = session.topicBreakdown || {};
  const breakdownEntries = Object.entries(breakdown);
  const detailedAnswers = session.answers || [];

  const correctAnswersCount = detailedAnswers.filter((a) => a.isCorrect === true).length;
  const totalAnswersCount = detailedAnswers.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title={session.topic ? `${session.topic} — Diagnostic Report` : "Assessment Diagnostic Report"}
        description="Your technical performance has been dynamically evaluated and calculated against company interview benchmarks."
        badge={
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Real Performance Calculated
          </Badge>
        }
        action={
          <div className="flex items-center gap-2">
            <Link to="/assessments">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>New Diagnostic</span>
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
              {totalAnswersCount > 0 && (
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {correctAnswersCount} of {totalAnswersCount} questions correct
                </span>
              )}
            </div>
            <Badge
              variant={score >= 70 ? "success" : score >= 40 ? "warning" : "destructive"}
              className="px-3 py-1 text-xs"
            >
              {score >= 70
                ? "Placement Ready Baseline"
                : score >= 40
                ? "Moderate Foundation — Needs Refinement"
                : "Needs Targeted Revision"}
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
              Real accuracy calculated across topics tested in this assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {breakdownEntries.length > 0 ? (
              <TopicMasteryBarChart breakdown={breakdown} />
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                No topic responses recorded for this session.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Topic by Topic Breakdown Cards */}
      {breakdownEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Matrix Breakdown</CardTitle>
            <CardDescription>
              Objective calculation of accuracy, questions attempted, and assigned proficiency levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {breakdownEntries.map(([topic, stats]) => {
                const acc = stats.accuracy !== undefined ? stats.accuracy : stats.total > 0 ? stats.correct / stats.total : 0;
                const accuracyPct = Math.round(acc * 100);

                return (
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
                          {stats.proficiency || "evaluated"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats.correct} of {stats.total} questions answered correctly
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-200">
                          {accuracyPct}%
                        </span>
                        <span className="text-[10px] text-muted-foreground block">Accuracy</span>
                      </div>
                      <div className="w-24 bg-secondary/80 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${accuracyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Question by Question Review */}
      {detailedAnswers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Question Evaluation & Review</h3>
              <p className="text-xs text-muted-foreground">
                Review your responses, correct answers, and detailed explanations
              </p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {correctAnswersCount} / {totalAnswersCount} Correct
            </span>
          </div>

          <div className="space-y-4">
            {detailedAnswers.map((item, index) => {
              const q = item.question;
              const isCorrect = item.isCorrect === true;
              const studentOpt = item.studentAnswer?.selectedOption || item.studentAnswer?.code || item.studentAnswer?.text;

              return (
                <Card
                  key={item.id || index}
                  className={`border transition-all ${
                    isCorrect
                      ? "border-emerald-500/30 bg-card/60"
                      : "border-rose-500/30 bg-card/60"
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-300">
                          Question {index + 1}
                        </span>
                        {q?.difficulty && (
                          <Badge
                            variant={
                              q.difficulty === "hard"
                                ? "destructive"
                                : q.difficulty === "medium"
                                ? "warning"
                                : "success"
                            }
                            className="text-[10px] capitalize"
                          >
                            {q.difficulty}
                          </Badge>
                        )}
                        {q?.topic && (
                          <Badge variant="outline" className="text-[10px]">
                            {q.topic}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {q?.companyTags && q.companyTags.length > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-purple-300">
                            <Building2 className="h-3 w-3" />
                            <span>{q.companyTags.join(", ")}</span>
                          </div>
                        )}
                        <Badge
                          variant={isCorrect ? "success" : "destructive"}
                          className="gap-1 text-[10px]"
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" /> Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" /> Incorrect
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-100 leading-relaxed">
                        {q?.prompt || "Question prompt"}
                      </p>

                      {/* Display response details */}
                      {q?.type === "coding" ? (
                        <div className="space-y-2 pt-2">
                          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                            <Code2 className="h-3.5 w-3.5 text-blue-400" />
                            <span>Your Submitted Code:</span>
                          </span>
                          <pre className="p-3 rounded-xl bg-black/60 border border-border/60 text-xs font-mono text-emerald-300 overflow-x-auto max-h-48">
                            {studentOpt || "(No code submitted)"}
                          </pre>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-3 rounded-xl bg-secondary/30 border border-border/60">
                            <span className="text-muted-foreground block mb-1">Your Selected Answer:</span>
                            <span
                              className={`font-semibold block ${
                                isCorrect ? "text-emerald-300" : "text-rose-300"
                              }`}
                            >
                              {studentOpt || "(No answer selected)"}
                            </span>
                          </div>

                          {!isCorrect && q?.correctOption && (
                            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                              <span className="text-emerald-400 block mb-1">Correct Answer:</span>
                              <span className="font-semibold text-emerald-200 block">
                                {q.correctOption}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation feedback */}
                      {q?.explanation && (
                        <div className="p-3 rounded-xl bg-secondary/20 border border-border/40 text-xs text-slate-300 mt-2">
                          <span className="font-semibold text-slate-200 block mb-0.5 flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                            <span>Key Takeaway & Explanation:</span>
                          </span>
                          <p className="leading-relaxed text-muted-foreground">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

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
