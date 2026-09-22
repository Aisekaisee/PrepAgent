import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Play,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assessmentApi } from "./api/assessmentApi";
import type { AssessmentSession } from "@/types/assessment";

export function AssessmentHubPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AssessmentSession[]>([]);
  const [starting, setStarting] = useState(false);

  const topics = [
    "Full Placement Diagnostic (Adaptive)",
    "Data Structures & Algorithms",
    "Dynamic Programming & Graphs",
    "System Design & Scalability",
    "Operating Systems & Concurrency",
    "Database Management Systems",
    "Quantitative Aptitude & Logic",
  ];

  useEffect(() => {
    async function load() {
      try {
        const history = await assessmentApi.getHistory();
        setSessions(history);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleStart = async (topicName?: string) => {
    try {
      setStarting(true);
      const session = await assessmentApi.startSession(topicName);
      navigate(`/assessments/${session.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Skill Assessment Engine"
        description="Take adaptive multi-topic diagnostics. The engine dynamically calibrates question difficulty based on your rolling accuracy."
        action={
          <Button
            onClick={() => handleStart()}
            variant="gradient"
            size="lg"
            disabled={starting}
            className="gap-2 shadow-lg shadow-indigo-500/25"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Start Adaptive Diagnostic</span>
          </Button>
        }
      />

      {/* Featured Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-purple-950/60 p-8 backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge variant="purple" className="gap-1 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Phase 3 Engine — Adaptive Calibration</span>
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Pinpoint your exact proficiency across core interview pillars
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our multi-format assessment engine tests algorithmic thinking, code generation, and core computer science fundamentals. Test results directly update your skill-gap vector.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => handleStart("Full Placement Diagnostic (Adaptive)")}
              variant="default"
              className="gap-2"
              disabled={starting}
            >
              <Play className="h-4 w-4" />
              <span>Take Full Diagnostic (15 Mins)</span>
            </Button>
            <Link to="/skill-gap">
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>View Skill-Gap Matrix</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Topic specific diagnostic cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Topic-Specific Sprints</h3>
            <p className="text-xs text-muted-foreground">Focus your practice on a specific technical subject</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.slice(1).map((topic) => (
            <Card
              key={topic}
              className="hover:border-primary/50 transition-all hover:-translate-y-0.5 group cursor-pointer"
              onClick={() => handleStart(topic)}
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-secondary/80 text-blue-400 group-hover:text-blue-300">
                      <Layers className="h-4 w-4" />
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      5-8 Questions
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition-colors">
                    {topic}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Adaptive challenge set covering key patterns requested by top tier companies.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-blue-400 font-medium">
                  <span>Start Sprint</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Past Assessment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <CardTitle>Assessment History</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">{sessions.length} sessions logged</span>
          </div>
          <CardDescription>
            Review previous diagnostic results, accuracy breakdown, and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-100">
                      {sess.topic || "Placement Diagnostic"}
                    </h4>
                    <Badge variant="success" className="text-[10px]">
                      Completed
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(sess.startedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {sess.topicBreakdown
                        ? `${Object.keys(sess.topicBreakdown).length} Topics Evaluated`
                        : "General Diagnostic"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Overall Score</span>
                    <span className="font-bold text-lg text-emerald-400">
                      {sess.score !== undefined ? `${sess.score}%` : "Pending"}
                    </span>
                  </div>
                  <Link to={`/assessments/${sess.id}/results`}>
                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                      <span>View Results</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
