import { useState, useEffect } from "react";
import {
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Award,
  TrendingUp,
  Calendar,
  Layers,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressPaceChart } from "@/components/charts/ProgressPaceChart";
import { reportsApi, type ProgressReportData } from "./api/reportsApi";

export function ReportsPage() {
  const [report, setReport] = useState<ProgressReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await reportsApi.getProgressReport();
        setReport(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prepagent-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 print:p-0 print:space-y-4">
      <PageHeader
        title="Placement Readiness & Diagnostic Report"
        description="Comprehensive evaluation of overall preparedness, velocity vs. plan, and skill resilience across target company rubrics."
        action={
          <div className="flex items-center gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="text-xs gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="text-xs gap-1.5"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-950/40 via-card to-card border-blue-500/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-foreground block">
                {report.readinessScore}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Overall Readiness
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-foreground block">
                {report.averageAccuracy}%
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Average Test Accuracy
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-foreground block">
                {report.completedMilestones}/{report.totalMilestones}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Milestones Completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 border-border/70">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-foreground block">
                {report.assessmentsCount}
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">
                Diagnostic Rounds
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pace vs Plan Area Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preparation Velocity vs. Plan (8-Week Track)</CardTitle>
              <CardDescription>
                Comparison between your target milestone pace and actual completed competencies
              </CardDescription>
            </div>
            <Badge variant="success" className="text-xs">
              Pacing +3% Ahead
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ProgressPaceChart data={report.paceVsPlan} />
        </CardContent>
      </Card>

      {/* Strengths & Vulnerabilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Pillars */}
        <Card className="border-emerald-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <CardTitle>Demonstrated Strengths</CardTitle>
            </div>
            <CardDescription>
              Pillars where your performance exceeds target company expectations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {report.strongPillars.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2.5"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Vulnerabilities */}
        <Card className="border-rose-500/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <CardTitle>Critical Focus Areas</CardTitle>
            </div>
            <CardDescription>
              Deficits that risk rejection in technical screening rounds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {report.vulnerablePillars.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 flex items-center gap-2.5"
              >
                <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
