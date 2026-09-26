import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Map,
  MessageSquare,
  BookOpen,
  FileBarChart2,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();

  const navItems = [
    {
      to: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      description: "Overview & progress",
    },
    {
      to: "/assessments",
      icon: BrainCircuit,
      label: "Assessments",
      badge: "Adaptive",
      description: "MCQ & Coding tests",
    },
    {
      to: "/skill-gap",
      icon: Compass,
      label: "Skill-Gap Matrix",
      description: "Benchmark vs FAANG",
    },
    {
      to: "/roadmap",
      icon: Map,
      label: "AI Roadmap",
      badge: "AI Agent",
      description: "Weekly milestones",
    },
    {
      to: "/chat",
      icon: MessageSquare,
      label: "Placement Coach",
      badge: "Live SSE",
      description: "RAG interview assistant",
    },
    {
      to: "/resources",
      icon: BookOpen,
      label: "Resource Bank",
      description: "Problems & curated docs",
    },
    {
      to: "/reports",
      icon: FileBarChart2,
      label: "Readiness Reports",
      description: "Exportable analytics",
    },
    {
      to: "/profile",
      icon: UserCheck,
      label: "Profile & Targets",
      description: "Skills & companies",
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container: Solid Pure White */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 font-bold text-lg tracking-tight group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm group-hover:bg-slate-800 transition-all duration-200">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-extrabold text-base leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Prep<span className="text-emerald-600">Agent</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest font-semibold">
                AI Placement Platform
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Preparation Journey
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-0.5"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 font-semibold border-slate-300 bg-white text-slate-700"
                  >
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}

          {/* Admin section */}
          {user?.role === "admin" && (
            <div className="pt-4 mt-3 border-t border-slate-200">
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-0.5"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-4 w-4 text-emerald-600" />
                  <span>Admin Console</span>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-300 bg-emerald-50 text-emerald-700">
                  Manage
                </Badge>
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom Roadmap Status Widget */}
        <div className="p-4 m-3 rounded-lg border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Roadmap Progress
            </span>
            <span className="text-[11px] font-bold text-emerald-600">78% Readiness</span>
          </div>
          <Progress value={78} className="h-1.5 mb-2.5 bg-slate-200" />
          <NavLink
            to="/roadmap"
            onClick={onClose}
            className="flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200 group"
          >
            <span>Current: System Design</span>
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </NavLink>
        </div>
      </aside>
    </>
  );
}
