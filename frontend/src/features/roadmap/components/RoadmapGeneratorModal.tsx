import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Cpu,
  Database,
  Check,
  Loader2,
  Terminal,
  AlertCircle,
  UserCheck,
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
  const [currentMessage, setCurrentMessage] = useState("Initializing LangGraph pipeline with Gemini AI...");
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [newRoadmap, setNewRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setLogs([]);
      setIsCompleted(false);
      setErrorMsg(null);
      setNewRoadmap(null);
      return;
    }

    // Start generation stream
    setLogs(["[0.0s] Connecting to Gemini LangGraph agent pipeline..."]);
    setErrorMsg(null);

    roadmapApi.generateRoadmapStream(
      (event: RoadmapProgressEvent) => {
        if (typeof event.percentage === "number") {
          setProgress(event.percentage);
        }
        if (event.message) {
          setCurrentMessage(event.message);
          setLogs((prev) => [
            ...prev,
            `[node: ${event.node || "pipeline"}] ${event.message}`,
          ]);
        }
      },
      (roadmap: Roadmap) => {
        setIsCompleted(true);
        setNewRoadmap(roadmap);
        setProgress(100);
        setCurrentMessage("Roadmap synthesized & saved successfully!");
        setLogs((prev) => [
          ...prev,
          "[success] Dynamic roadmap synthesized according to your profile targets. Version bumped.",
        ]);
      },
      (err: Error) => {
        setErrorMsg(err.message || "Failed to generate roadmap");
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
              <span>LangGraph.js + Gemini 3.8 Flash</span>
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-slate-100">
            {errorMsg
              ? "Roadmap Generation Paused"
              : isCompleted
              ? "Roadmap Generation Complete!"
              : "Synthesizing AI Roadmap..."}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Multi-node graph generating dynamic weeks tailored to your Preparation Time, Target Companies, and Subjects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-2">
          {errorMsg ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold text-rose-300">Generation Error</p>
                <p className="text-muted-foreground">{errorMsg}</p>
                {errorMsg.toLowerCase().includes("profile") && (
                  <div className="pt-2">
                    <Link to="/profile" onClick={() => onOpenChange(false)}>
                      <Button size="sm" variant="gradient" className="gap-1.5 text-xs h-7">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Configure Student Profile</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
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
                    progress >= 30
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : progress >= 15
                      ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                      : "bg-secondary/30 border-border/50 text-muted-foreground"
                  }`}
                >
                  <Cpu className="h-4 w-4 mx-auto mb-1" />
                  <span>Profile & Targets</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-colors ${
                    progress >= 80
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : progress >= 45
                      ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                      : "bg-secondary/30 border-border/50 text-muted-foreground"
                  }`}
                >
                  <Sparkles className="h-4 w-4 mx-auto mb-1" />
                  <span>Gemini Flash</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border transition-colors ${
                    progress >= 100
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : progress >= 90
                      ? "bg-blue-950/40 border-blue-500/40 text-blue-300"
                      : "bg-secondary/30 border-border/50 text-muted-foreground"
                  }`}
                >
                  <Database className="h-4 w-4 mx-auto mb-1" />
                  <span>Curated Practice</span>
                </div>
              </div>
            </>
          )}

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
                    ? "text-rose-400 font-semibold"
                    : log.includes("[success]")
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-300"
                }`}
              >
                {log}
              </div>
            ))}
            {!isCompleted && !errorMsg && (
              <div className="flex items-center gap-1 text-blue-400 animate-pulse">
                <span>&gt;</span>
                <span className="h-2 w-1 bg-blue-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {errorMsg ? (
            <Button
              onClick={() => onOpenChange(false)}
              variant="secondary"
              size="sm"
            >
              Close
            </Button>
          ) : isCompleted ? (
            <Button
              onClick={handleFinish}
              variant="gradient"
              className="gap-2 w-full sm:w-auto"
            >
              <Check className="h-4 w-4" />
              <span>View Dynamic Roadmap</span>
            </Button>
          ) : (
            <Button variant="secondary" size="sm" disabled className="gap-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Synthesizing with Gemini...</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
