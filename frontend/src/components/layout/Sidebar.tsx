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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-border/80 bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-6">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 font-bold text-lg tracking-tight group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-100 font-extrabold text-base leading-tight">
                Prep<span className="text-blue-500">Agent</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                AI Placement Prep
              </span>
            </div>
          </NavLink>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
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
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-primary/15 text-blue-400 font-semibold border border-primary/20 shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant="default"
                    className="text-[9px] px-1.5 py-0 font-normal uppercase"
                  >
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}

          {/* Admin section */}
          {user?.role === "admin" && (
            <div className="pt-4 mt-3 border-t border-border/60">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-purple-400 mb-2">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-4 w-4 text-purple-400" />
                  <span>Admin Console</span>
                </div>
                <Badge variant="purple" className="text-[9px] px-1.5 py-0">
                  Manage
                </Badge>
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom Roadmap Status Widget */}
        <div className="p-4 m-3 rounded-2xl border border-border/80 bg-gradient-to-b from-card to-background/50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-300">
              Roadmap Velocity
            </span>
            <span className="text-[11px] font-bold text-blue-400">25% (Wk 2/8)</span>
          </div>
          <Progress value={25} className="h-1.5 mb-2.5" />
          <NavLink
            to="/roadmap"
            onClick={onClose}
            className="flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>Current: Dynamic Programming</span>
            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </NavLink>
        </div>
      </aside>
    </>
  );
}
