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
    <div className="min-h-screen w-full flex bg-[#f8f9fa] text-[#1e293b] relative overflow-hidden">
      {/* Left Hero showcase (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative border-r border-slate-200 bg-white">
        <div>
          <Link to="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm group-hover:bg-slate-800 transition-all duration-200">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-slate-900 font-extrabold text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Prep<span className="text-emerald-600">Agent</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            <Terminal className="h-3.5 w-3.5 text-slate-900" />
            <span>AI Placement Readiness Architecture</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Close your skill gaps. Crack top-tier tech placements.
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            Adaptive multi-round assessments, benchmarked against real company hiring rubrics, synthesized into a personalized week-by-week learning roadmap powered by LangGraph.js and Gemini.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Adaptive difficulty questions that scale with your performance",
              "Precision skill-gap analysis vs Google, Amazon & Uber standards",
              "Real-time streaming placement coach with semantic RAG memory",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>&copy; {new Date().getFullYear()} PrepAgent Inc.</span>
          <Link to="/dashboard" className="flex items-center gap-1 text-slate-900 font-bold hover:text-emerald-600 transition-colors duration-200">
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Sparkles className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-slate-900 font-extrabold text-xl">
                Prep<span className="text-emerald-600">Agent</span>
              </span>
            </Link>
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
