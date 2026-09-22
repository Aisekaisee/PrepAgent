import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Filter,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/common/StatusBadge";
import { RoadmapGeneratorModal } from "./components/RoadmapGeneratorModal";
import { roadmapApi } from "./api/roadmapApi";
import type { Roadmap, RoadmapItemStatus } from "@/types/roadmap";

export function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const data = await roadmapApi.getActiveRoadmap();
        setRoadmap(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (itemId: string, newStatus: RoadmapItemStatus) => {
    if (!roadmap) return;

    // Optimistic update
    setRoadmap((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((it) =>
          it.id === itemId ? { ...it, status: newStatus } : it
        ),
      };
    });

    await roadmapApi.updateItemStatus(itemId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const items = roadmap?.items || [];
  const completedCount = items.filter((i) => i.status === "completed").length;
  const percentComplete = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const filteredItems =
    statusFilter === "all"
      ? items
      : items.filter((i) => i.status === statusFilter);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <PageHeader
        title="AI-Generated Learning Roadmap"
        description="Structured, week-by-week placement curriculum tailored specifically to your diagnostic skill gaps and target companies."
        badge={
          <Badge variant="purple" className="gap-1">
            <Sparkles className="h-3 w-3" /> LangGraph Agent v{roadmap?.version || 1}
          </Badge>
        }
        action={
          <Button
            onClick={() => setModalOpen(true)}
            variant="gradient"
            className="gap-2 shadow-md shadow-indigo-500/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Regenerate with AI (SSE)</span>
          </Button>
        }
      />

      {/* Velocity and Progress Banner */}
      <Card className="bg-gradient-to-r from-card via-card to-blue-950/20 border-border/80">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Roadmap Progress</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-foreground">{percentComplete}%</span>
                <span className="text-xs text-emerald-400 font-semibold">On Pace</span>
              </div>
              <Progress value={percentComplete} className="h-2 mt-2" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Completed Milestones</span>
              <p className="text-2xl font-bold text-foreground">
                {completedCount} <span className="text-xs text-muted-foreground font-normal">of {items.length} Weeks</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-medium">Currently Active</span>
              <p className="text-2xl font-bold text-blue-400">
                Week 2 <span className="text-xs text-muted-foreground font-normal">(In Progress)</span>
              </p>
            </div>

            <div className="flex justify-end">
              <Link to="/reports">
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <span>View Progress Report</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-slate-300">Filter Milestones:</span>
        </div>

        <div className="flex gap-1.5">
          {["all", "started", "completed", "pending"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors cursor-pointer border ${
                statusFilter === st
                  ? "bg-primary text-white border-primary"
                  : "bg-secondary/50 text-muted-foreground border-border/60 hover:text-foreground"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Week-by-Week Timeline Cards */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className={`border transition-all duration-200 ${
              item.status === "started"
                ? "border-blue-500/50 bg-card/90 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20"
                : item.status === "completed"
                ? "border-emerald-500/30 bg-card/60 opacity-90"
                : "border-border/70 bg-card/70"
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary font-mono text-xs font-bold text-foreground border border-border/80">
                    W{item.weekNo}
                  </span>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-100">
                      {item.topic}
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground">
                      Focus Area: Interview Core Pillar
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <StatusBadge status={item.status} />

                  {/* Status Toggle Quick Actions */}
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as RoadmapItemStatus)
                    }
                    className="bg-secondary/70 border border-border/70 text-[11px] rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="pending">Mark Pending</option>
                    <option value="started">Mark In Progress</option>
                    <option value="completed">Mark Completed</option>
                    <option value="skipped">Mark Skipped</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-1">
              {/* Goals checklist */}
              <div className="space-y-2 bg-secondary/30 p-3.5 rounded-xl border border-border/40">
                <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                  Weekly Learning Goals:
                </span>
                <div className="space-y-1.5">
                  {item.goals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          item.status === "completed"
                            ? "text-emerald-400"
                            : "text-muted-foreground/60"
                        }`}
                      />
                      <span className={item.status === "completed" ? "line-through opacity-70" : ""}>
                        {goal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linked RAG Resource Recommendations */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                  <span>Curated Study Material:</span>
                  <span className="text-slate-300 font-medium">
                    ChromaDB Vector Matching
                  </span>
                </div>

                <Link
                  to={`/resources?topic=${encodeURIComponent(item.topic)}`}
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>Practice Set</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SSE Generator Modal */}
      <RoadmapGeneratorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onGenerated={(newRoadmap) => {
          setRoadmap(newRoadmap);
        }}
      />
    </div>
  );
}
