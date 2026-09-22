import { useState, useEffect } from "react";
import {
  Sparkles,
  Cpu,
  Database,
  Check,
  Loader2,
  Terminal,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { roadmapApi } from "../api/roadmapApi";
import type { Roadmap, RoadmapProgressEvent } from "@/types/roadmap";

interface RoadmapGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (roadmap: Roadmap) => void;
}

export function RoadmapGeneratorModal({
  open,
  onOpenChange,
  onGenerated,
}: RoadmapGeneratorModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Initializing LangGraph.js pipeline...");
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newRoadmap, setNewRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setLogs([]);
      setIsCompleted(false);
      setNewRoadmap(null);
      return;
    }

    // Start generation stream
    setLogs(["[0.0s] Connecting to agent worker SSE channel..."]);

    roadmapApi.generateRoadmapStream(
      (event: RoadmapProgressEvent) => {
        setProgress(event.percentage);
        setCurrentMessage(event.message);
        setLogs((prev) => [
          ...prev,
          `[node: ${event.node || "pipeline"}] ${event.message}`,
        ]);
      },
      (roadmap: Roadmap) => {
        setIsCompleted(true);
        setNewRoadmap(roadmap);
        setLogs((prev) => [
          ...prev,
          "[success] Roadmap synthesized and persisted. Version bumped.",
        ]);
      },
      (err: Error) => {
        setLogs((prev) => [...prev, `[error] ${err.message}`]);
      }
    );
  }, [open]);

  const handleFinish = () => {
    if (newRoadmap) {
      onGenerated(newRoadmap);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border/80 bg-[#090d16]/95 backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" className="gap-1 px-2.5 py-0.5 text-[10px]">
              <Sparkles className="h-3 w-3" />
              <span>LangGraph.js Agent Pipeline</span>
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-100">
            {isCompleted ? "Roadmap Generation Complete!" : "Synthesizing AI Roadmap..."}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Multi-node graph executing with Gemini LLM and ChromaDB vector retrieval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-2">
          {/* Progress Bar & Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{currentMessage}</span>
              <span className="font-mono font-bold text-blue-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Node Pipeline Steps Visualizer */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div
              className={`p-2.5 rounded-xl border transition-colors ${
                progress >= 40
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  : progress >= 18
                  ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                  : "bg-secondary/30 border-border/50 text-muted-foreground"
              }`}
            >
              <Cpu className="h-4 w-4 mx-auto mb-1" />
              <span>Skill Vector</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border transition-colors ${
                progress >= 85
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  : progress >= 62
                  ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                  : "bg-secondary/30 border-border/50 text-muted-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 mx-auto mb-1" />
              <span>Gemini LLM</span>
            </div>

            <div
              className={`p-2.5 rounded-xl border transition-colors ${
                progress >= 100
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  : progress >= 95
                  ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                  : "bg-secondary/30 border-border/50 text-muted-foreground"
              }`}
            >
              <Database className="h-4 w-4 mx-auto mb-1" />
              <span>ChromaDB RAG</span>
            </div>
          </div>

          {/* Live Agent Terminal Stream Box */}
          <div className="rounded-xl border border-border/80 bg-black/70 p-3 font-mono text-[11px] text-slate-300 h-36 overflow-y-auto space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground pb-1 border-b border-white/5 mb-1.5">
              <Terminal className="h-3 w-3" />
              <span>agent-worker.log</span>
            </div>
            {logs.map((log, i) => (
              <div
                key={i}
                className={`leading-relaxed ${
                  log.includes("[error]")
                    ? "text-rose-400"
                    : log.includes("[success]")
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-300"
                }`}
              >
                {log}
              </div>
            ))}
            {!isCompleted && (
              <div className="flex items-center gap-1 text-blue-400 animate-pulse">
                <span>&gt;</span>
                <span className="h-2 w-1 bg-blue-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {isCompleted ? (
            <Button
              onClick={handleFinish}
              variant="gradient"
              className="gap-2 w-full sm:w-auto"
            >
              <Check className="h-4 w-4" />
              <span>View Updated Roadmap</span>
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled className="gap-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Running Graph Execution...</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
