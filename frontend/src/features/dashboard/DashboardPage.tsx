import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Map,
  BrainCircuit,
  Compass,
  MessageSquare,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { profileApi } from "@/features/profile/api/profileApi";
import type { Profile } from "@/types/profile";

export function DashboardPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    profileApi.getProfile().then(setProfile);
  }, []);

  const targetCompanies = profile?.targetCompanies || ["Google", "Amazon", "Microsoft", "Uber"];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-blue-950/70 via-indigo-950/60 to-purple-950/70 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <Badge variant="purple" className="gap-1 px-3 py-1 text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Target Companies: {targetCompanies.join(", ")}</span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.email ? user.email.split("@")[0] : "Student"}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You are currently in <strong>Week 2 of 8</strong> of your personalized roadmap. Your top focus area this week is <strong>Dynamic Programming & Subsequence Patterns</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/roadmap">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-indigo-500/25">
                <Map className="h-4 w-4" />
                <span>Resume Roadmap</span>
              </Button>
            </Link>
            <Link to="/assessments">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                <BrainCircuit className="h-4 w-4" />
                <span>Take Diagnostic</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Core Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Placement Readiness</span>
              <span className="text-2xl font-extrabold text-foreground block">78%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">+4% this week</span>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Roadmap Progress</span>
              <span className="text-2xl font-extrabold text-blue-400 block">25%</span>
              <span className="text-[10px] text-muted-foreground">Week 2 of 8 Active</span>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Map className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Diagnostic Rounds</span>
              <span className="text-2xl font-extrabold text-emerald-400 block">4 Tests</span>
              <span className="text-[10px] text-muted-foreground">74.2% Avg Accuracy</span>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">High Skill Gaps</span>
              <span className="text-2xl font-extrabold text-rose-400 block">2 Deficits</span>
              <span className="text-[10px] text-rose-300">DP & System Design</span>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Active Week Milestone + Skill Gap Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Week Card */}
        <Card className="lg:col-span-7 border-blue-500/40 bg-card/90 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  Current Milestone
                </Badge>
                <span className="text-xs text-muted-foreground">Week 2 of 8</span>
              </div>
              <Badge variant="warning" className="text-[10px]">
                In Progress
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-slate-100 mt-2">
              Dynamic Programming: 1D & Subsequence
            </CardTitle>
            <CardDescription className="text-xs">
              Directly addresses your primary skill gap against Google & Amazon hiring bars
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2 bg-secondary/30 p-3.5 rounded-xl border border-border/50 text-xs">
              <span className="font-semibold text-slate-300 block">This Week's Targets:</span>
              <div className="space-y-1.5">
                {[
                  "Climbing stairs to Coin Change variations (Done)",
                  "Longest Common Subsequence & Edit Distance (Pending)",
                  "Space optimization memoization tricks (Pending)",
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        i === 0 ? "text-emerald-400" : "text-muted-foreground"
                      }`}
                    />
                    <span className={i === 0 ? "line-through text-muted-foreground" : ""}>
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link to="/resources?topic=Dynamic%20Programming">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Practice 8 Curated DP Problems</span>
                </Button>
              </Link>
              <Link to="/roadmap">
                <Button variant="default" size="sm" className="gap-1.5 text-xs">
                  <span>Open Roadmap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Placement Coach Action */}
        <Card className="lg:col-span-5 flex flex-col justify-between border-border/80 bg-card/75">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Ask Placement Coach</CardTitle>
                <CardDescription className="text-xs">
                  Instant real-time answers to technical questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2.5">
            <p className="text-xs text-muted-foreground">
              Your AI coach knows your diagnostic scores and target companies. Select a prompt to start chatting:
            </p>

            <div className="space-y-1.5">
              {[
                "How do I recognize 2D DP problems in an interview?",
                "Conduct a mock question for Google SWE interview",
                "Explain the CAP Theorem with concrete DB examples",
              ].map((q, idx) => (
                <Link
                  key={idx}
                  to="/chat"
                  className="block p-2.5 rounded-xl bg-secondary/40 hover:bg-secondary border border-border/50 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  "{q}" ➔
                </Link>
              ))}
            </div>
          </CardContent>

          <div className="p-6 pt-0">
            <Link to="/chat">
              <Button variant="gradient" className="w-full gap-2 text-xs">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Launch Placement Coach</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/skill-gap" className="group">
          <Card className="h-full hover:border-primary/50 transition-all hover:-translate-y-0.5">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground group-hover:text-blue-400 transition-colors">
                  Skill-Gap Matrix
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Radar comparison against company hiring thresholds.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/resources" className="group">
          <Card className="h-full hover:border-primary/50 transition-all hover:-translate-y-0.5">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground group-hover:text-purple-400 transition-colors">
                  Practice Resource Bank
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Curated problems and design patterns with filters.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports" className="group">
          <Card className="h-full hover:border-primary/50 transition-all hover:-translate-y-0.5">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                  Progress & Readiness Reports
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Pace velocity graphs and printable summary exports.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
