import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, CheckCircle2, Terminal, ArrowRight } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-[#060911] text-foreground relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Left Hero showcase (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative border-r border-border/60 bg-card/20 backdrop-blur-sm">
        <div>
          <Link to="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-slate-100 font-extrabold text-xl">
              Prep<span className="text-blue-500">Agent</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>AI Placement Readiness Architecture</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Close your skill gaps. Crack top-tier tech placements.
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Adaptive multi-round assessments, benchmarked against real company hiring rubrics, synthesized into a personalized week-by-week learning roadmap powered by LangGraph.js and Gemini.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Adaptive difficulty questions that scale with your performance",
              "Precision skill-gap analysis vs Google, Amazon & Uber standards",
              "Real-time streaming placement coach with semantic RAG memory",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} PrepAgent Inc.</span>
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <span>Explore Demo</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Right Form side */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-slate-100 font-extrabold text-xl">
                Prep<span className="text-blue-500">Agent</span>
              </span>
            </Link>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
