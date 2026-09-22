import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  BrainCircuit,
  TrendingUp,
  FileQuestion,
  Plus,
  Building2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { adminApi } from "./api/adminApi";
import type { AdminAnalytics } from "@/types/admin";

export function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // New question form state
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [type, setType] = useState<"coding" | "aptitude" | "technical">("technical");
  const [createdSuccess, setCreatedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await adminApi.getAnalytics();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !prompt) return;

    await adminApi.createQuestion({
      topic,
      difficulty,
      type,
      content: { prompt },
    });

    setTopic("");
    setPrompt("");
    setCreatedSuccess(true);
    setTimeout(() => setCreatedSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="Admin Control Center"
        description="Phase 6 Platform administration: monitor active student velocity, maintain Question & Resource collections, and tune hiring bar benchmarks."
        badge={
          <Badge variant="purple" className="gap-1">
            <ShieldAlert className="h-3.5 w-3.5" /> Administrator Mode
          </Badge>
        }
      />

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block">
                {analytics.activeStudents7d.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">Active Students (7d)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block">
                {analytics.totalAssessments.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">Assessments Taken</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block">
                {analytics.avgRoadmapCompletion}%
              </span>
              <span className="text-xs text-muted-foreground">Avg Roadmap Completion</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground block">
                14 Companies
              </span>
              <span className="text-xs text-muted-foreground">Hiring Rubrics Active</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="gaps">
        <TabsList>
          <TabsTrigger value="gaps">Platform Skill Deficits</TabsTrigger>
          <TabsTrigger value="questions">Question Bank CRUD</TabsTrigger>
          <TabsTrigger value="companies">Company Requirements</TabsTrigger>
        </TabsList>

        {/* Most Common Gaps */}
        <TabsContent value="gaps">
          <Card>
            <CardHeader>
              <CardTitle>Most Prevalent Student Skill Deficits</CardTitle>
              <CardDescription>
                Aggregated across thousands of diagnostic runs to inform curriculum curation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                {analytics.mostCommonGaps.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3.5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-sm text-foreground block">
                        {item.topic}
                      </span>
                      <span className="text-muted-foreground">
                        Identified in {item.count} student diagnostics
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive" className="text-[10px]">
                        Avg Gap Severity: {item.avgGap} / 4.0
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Bank Manager */}
        <TabsContent value="questions">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <Card className="md:col-span-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-5 w-5 text-blue-400" />
                  <CardTitle>Add Diagnostic Question</CardTitle>
                </div>
                <CardDescription>
                  Inject new problems into the adaptive assessment question bank
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                  {createdSuccess && (
                    <div className="p-3 text-xs rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Question published to assessment bank successfully!</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Topic</label>
                    <Input
                      placeholder="e.g. Dynamic Programming, Graph Theory, System Design"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-secondary/60 border border-border/80 text-xs rounded-xl p-2.5 text-foreground"
                      >
                        <option value="technical">Technical Concept</option>
                        <option value="coding">Coding Challenge</option>
                        <option value="aptitude">Aptitude & Logic</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full bg-secondary/60 border border-border/80 text-xs rounded-xl p-2.5 text-foreground"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Question Prompt</label>
                    <textarea
                      placeholder="Enter problem statement or conceptual question prompt..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      required
                      className="w-full min-h-[100px] bg-secondary/50 border border-border/80 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <Button type="submit" variant="gradient" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Publish Question</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="md:col-span-6">
              <CardHeader>
                <CardTitle>Recent Questions in Bank</CardTitle>
                <CardDescription>Questions served in adaptive test sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    topic: "Data Structures",
                    diff: "medium",
                    prompt: "Hash Table average vs worst-case linear probing complexity",
                  },
                  {
                    topic: "Dynamic Programming",
                    diff: "hard",
                    prompt: "Coin Change minimum elements optimization",
                  },
                  {
                    topic: "Operating Systems",
                    diff: "medium",
                    prompt: "Coffman's Deadlock Conditions exclusion",
                  },
                  {
                    topic: "DBMS",
                    diff: "easy",
                    prompt: "ACID properties: Atomicity definition",
                  },
                ].map((q, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-secondary/30 border border-border/50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{q.topic}</span>
                      <Badge
                        variant={
                          q.diff === "hard"
                            ? "destructive"
                            : q.diff === "medium"
                            ? "warning"
                            : "success"
                        }
                        className="text-[9px] uppercase"
                      >
                        {q.diff}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{q.prompt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Company Requirements */}
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Target Company Hiring Rubrics</CardTitle>
              <CardDescription>
                Minimum expected competency levels by interview topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60 text-xs">
                {[
                  { company: "Google", topic: "Dynamic Programming", level: "Expert" },
                  { company: "Google", topic: "Graph Algorithms", level: "Advanced" },
                  { company: "Amazon", topic: "System Design", level: "Advanced" },
                  { company: "Amazon", topic: "Database Internals", level: "Advanced" },
                  { company: "Microsoft", topic: "Operating Systems", level: "Advanced" },
                  { company: "Uber", topic: "Low-Level Design", level: "Advanced" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between text-slate-300"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground w-24">
                        {item.company}
                      </span>
                      <span>{item.topic}</span>
                    </div>
                    <Badge variant="purple" className="text-[10px]">
                      Required: {item.level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
