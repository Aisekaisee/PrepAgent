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

  return (
    <div className="min-h-screen bg-[#060911] text-foreground relative overflow-hidden flex flex-col justify-between">
      {/* Radiant ambient glow spheres */}
      <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 left-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 flex h-18 w-full items-center justify-between border-b border-border/40 bg-background/60 px-6 sm:px-12 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-3 font-bold text-lg group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-slate-100 font-extrabold text-xl tracking-tight">
            Prep<span className="text-blue-500">Agent</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => handleLaunchDemo("student")}
            className="text-xs gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Full 16-Week Multi-Agent Placement System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          Your Autonomous AI Coach for Top-Tier Tech Placements
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Diagnostic adaptive tests calibrate your skill levels, benchmark your abilities against <strong>Google, Amazon & Microsoft</strong> hiring bars, and synthesize weekly roadmaps with ChromaDB RAG.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            variant="gradient"
            onClick={() => handleLaunchDemo("student")}
            className="w-full sm:w-auto px-8 gap-2 text-base shadow-xl shadow-indigo-500/25 h-12 rounded-xl"
          >
            <Zap className="h-5 w-5" />
            <span>Explore Student Experience</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => handleLaunchDemo("admin")}
            className="w-full sm:w-auto px-6 gap-2 text-base h-12 rounded-xl border-border/80 text-purple-300 hover:bg-purple-950/20"
          >
            <ShieldCheck className="h-5 w-5 text-purple-400" />
            <span>Explore Admin Console</span>
          </Button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-16 text-left">
          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-3 hover:border-blue-500/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Adaptive Diagnostic</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dynamically tunes question difficulty (Easy/Medium/Hard) based on rolling accuracy across coding and concepts.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-3 hover:border-purple-500/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Skill-Gap Matrix</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Compares your proficiency against hiring rubrics for Google, Amazon, Uber, and Meta to rank critical deficits.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-3 hover:border-indigo-500/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">LangGraph Roadmap</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Multi-node LangGraph.js pipeline with Gemini LLM and ChromaDB vector search that streams week-by-week goals.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-md space-y-3 hover:border-emerald-500/50 transition-colors">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-100">Placement Coach</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-time SSE token-by-token streaming AI interview mentor with RAG memory over your weak topics and practice sets.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/20 py-8 px-6 sm:px-12 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
              PA
            </div>
            <span className="text-slate-300 font-semibold">PrepAgent AI</span>
            <span>— Advanced Placement Preparation Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-foreground transition-colors">
              Create Account
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
