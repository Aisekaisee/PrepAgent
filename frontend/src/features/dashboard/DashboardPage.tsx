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
      {/* Welcome Hero Banner: Solid White Panel with Slate Border */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Target Bar: {targetCompanies.join(", ")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome back, {user?.email ? user.email.split("@")[0] : "Student"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You are currently in <strong className="text-slate-900 font-bold">Week 2 of 8</strong> of your placement roadmap. Primary focus: <strong className="text-slate-900 font-bold">Dynamic Programming & Subsequence Patterns</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link to="/roadmap">
              <Button variant="default" size="lg" className="w-full sm:w-auto gap-2">
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

      {/* Strict 4-Color Palette Engine: Core Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Readiness (Green Accent) */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Placement Readiness</span>
              <span className="text-3xl font-extrabold text-emerald-600 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>78%</span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">+4% this week</span>
            </div>
            <div className="h-11 w-11 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Stat 2: Roadmap Progress (Slate Charcoal) */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Roadmap Progress</span>
              <span className="text-3xl font-extrabold text-slate-900 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>25%</span>
              <span className="text-[11px] text-slate-600 font-medium">Week 2 of 8 Active</span>
            </div>
            <div className="h-11 w-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <Map className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Stat 3: Diagnostics Completed (Slate Charcoal) */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Diagnostic Tests</span>
              <span className="text-3xl font-extrabold text-slate-900 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>4 Tests</span>
              <span className="text-[11px] text-slate-600 font-medium">74.2% Avg Accuracy</span>
            </div>
            <div className="h-11 w-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Stat 4: High Skill Gaps (Amber Accent) */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Skill Deficits</span>
              <span className="text-3xl font-extrabold text-amber-600 block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>2 Deficits</span>
              <span className="text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">DP & System Design</span>
            </div>
            <div className="h-11 w-11 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Active Milestone + Placement Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Week Card */}
        <Card className="lg:col-span-7">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  Current Milestone
                </span>
                <span className="text-xs text-slate-500 font-medium">Week 2 of 8</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                In Progress
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 mt-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Dynamic Programming: 1D & Subsequence
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Directly addresses your skill gap against Google & Amazon hiring standards.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block text-xs">Target Learning Objectives:</span>
              <div className="space-y-2">
                {[
                  { text: "Climbing stairs to Coin Change variations", done: true },
                  { text: "Longest Common Subsequence & Edit Distance", done: false },
                  { text: "Space optimization memoization tricks", done: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-slate-700 font-medium">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        item.done ? "text-emerald-600" : "text-slate-300"
                      }`}
                    />
                    <span className={item.done ? "line-through text-slate-400 font-normal" : ""}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link to="/resources?topic=Dynamic%20Programming" className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1.5 text-xs">
                  <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                  <span>Practice Curated DP Problems</span>
                </Button>
              </Link>
              <Link to="/roadmap" className="w-full sm:w-auto">
                <Button variant="default" size="sm" className="w-full sm:w-auto gap-1.5 text-xs">
                  <span>Open Roadmap</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Placement Coach Action */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-900 text-white">
                <MessageSquare className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ask Placement Coach</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Instant RAG technical guidance
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Your AI coach knows your target companies and diagnostic results. Select a prompt:
            </p>

            <div className="space-y-2">
              {[
                "How do I recognize 2D DP problems in an interview?",
                "Conduct a mock question for Google SWE interview",
                "Explain the CAP Theorem with concrete DB examples",
              ].map((q, idx) => (
                <Link
                  key={idx}
                  to="/chat"
                  className="block p-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium hover:text-slate-900 transition-all duration-200"
                >
                  "{q}" ➔
                </Link>
              ))}
            </div>
          </CardContent>

          <div className="p-6 pt-0">
            <Link to="/chat">
              <Button variant="default" className="w-full gap-2 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Launch Placement Coach</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/skill-gap" className="group">
          <Card>
            <CardContent className="p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Skill-Gap Matrix
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Radar comparison against company hiring thresholds.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/resources" className="group">
          <Card>
            <CardContent className="p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Practice Resource Bank
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Curated problems and design patterns with filters.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/reports" className="group">
          <Card>
            <CardContent className="p-5 flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Progress & Readiness
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pace velocity graphs and exportable analytics.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
