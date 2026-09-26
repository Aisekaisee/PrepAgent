import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Compass,
  Map,
  MessageSquare,
  ShieldCheck,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

export function LandingPage() {
  const navigate = useNavigate();
  const { loginAsDemo } = useAuthStore();

  const handleLaunchDemo = (role: "student" | "admin" = "student") => {
    loginAsDemo(role);
    navigate("/dashboard");
  };

  const features = [
    {
      icon: BrainCircuit,
      title: "Adaptive Diagnostic",
      description:
        "Dynamically tunes question difficulty (Easy/Medium/Hard) based on rolling accuracy across coding and concepts.",
    },
    {
      icon: Compass,
      title: "Skill-Gap Matrix",
      description:
        "Compares your proficiency against hiring rubrics for Google, Amazon, Uber, and Meta to rank critical deficits.",
    },
    {
      icon: Map,
      title: "LangGraph Roadmap",
      description:
        "Multi-node LangGraph.js pipeline with Gemini LLM and ChromaDB vector search streaming week-by-week goals.",
    },
    {
      icon: MessageSquare,
      title: "Placement Coach",
      description:
        "Real-time SSE token-by-token streaming AI interview mentor with RAG memory over your weak topics and practice sets.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1e293b] relative overflow-hidden flex flex-col justify-between">

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 sm:px-12 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm group-hover:bg-slate-800 transition-all duration-200">
            <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Prep<span className="text-emerald-600">Agent</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 text-xs font-semibold">
              Sign In
            </Button>
          </Link>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleLaunchDemo("student")}
            className="text-xs gap-1.5"
          >
            <span>Live Demo</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 mb-8 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Full Multi-Agent Placement System</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* H1 Title */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6 text-slate-900"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Your Autonomous AI Coach{" "}
          <span className="text-emerald-600">for Top-Tier</span> Tech Placements
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
          Diagnostic adaptive tests calibrate your skill levels, benchmark your abilities against{" "}
          <strong className="text-slate-900 font-bold">Google, Amazon &amp; Microsoft</strong>{" "}
          hiring bars, and synthesize weekly roadmaps with ChromaDB RAG.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            size="lg"
            variant="default"
            onClick={() => handleLaunchDemo("student")}
            className="w-full sm:w-auto px-8 gap-2 text-base h-12 rounded-lg"
          >
            <Zap className="h-5 w-5 text-emerald-400" />
            <span>Explore Student Experience</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleLaunchDemo("admin")}
            className="w-full sm:w-auto px-7 gap-2 text-base h-12 rounded-lg"
          >
            <ShieldCheck className="h-5 w-5 text-slate-700" />
            <span>Explore Admin Console</span>
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group p-6 rounded-xl border border-slate-200 bg-white space-y-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08)] hover:border-slate-300"
              >
                <div className="h-11 w-11 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-200">
                  <Icon className="h-5 w-5" />
                </div>

                <h3
                  className="font-bold text-base text-slate-900 leading-snug"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-6 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[9px] font-extrabold">
              PA
            </div>
            <span className="text-slate-900 font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              PrepAgent AI
            </span>
            <span className="text-slate-300">—</span>
            <span>Advanced Placement Preparation Architecture</span>
          </div>
          <div className="flex items-center gap-5 font-semibold">
            <Link to="/login" className="hover:text-slate-900 transition-colors duration-200">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-slate-900 transition-colors duration-200">
              Create Account
            </Link>
            <span className="text-slate-300">•</span>
            <span className="font-normal">&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
