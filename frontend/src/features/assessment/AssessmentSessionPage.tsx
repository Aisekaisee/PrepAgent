import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  ArrowRight,
  Send,
  Loader2,
  Sparkles,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { assessmentApi } from "./api/assessmentApi";
import type { Question } from "@/types/assessment";

export function AssessmentSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [timeSeconds, setTimeSeconds] = useState(0);

  // Student answer state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [codeAnswer, setCodeAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeSeconds((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Load question
  useEffect(() => {
    async function fetchQuestion() {
      if (!sessionId) return;
      try {
        setLoading(true);
        const q = await assessmentApi.getNextQuestion(sessionId);
        if (q) {
          setQuestion(q);
          setSelectedOption(null);
          setCodeAnswer(q.content.codeTemplate || "");
          setFeedback(null);
          setShowHint(false);
        } else {
          // No more questions, submit session
          await handleFinish();
        }
      } finally {
        setLoading(false);
      }
    }
    fetchQuestion();
  }, [sessionId, questionNumber]);

  const handleSubmitAnswer = async () => {
    if (!sessionId || !question) return;

    try {
      setSubmitting(true);
      const answerPayload =
        question.type === "coding"
          ? { code: codeAnswer }
          : { selectedOption: selectedOption || "" };

      const result = await assessmentApi.submitAnswer(sessionId, question.id, answerPayload);
      setFeedback(result);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (questionNumber >= 5) {
      handleFinish();
    } else {
      setQuestionNumber((prev) => prev + 1);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    try {
      setSubmitting(true);
      await assessmentApi.submitSession(sessionId);
      navigate(`/assessments/${sessionId}/results`);
    } catch (err) {
      navigate(`/assessments/${sessionId}/results`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium text-slate-200">
          Calibrating next adaptive question based on your accuracy...
        </p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <h3 className="text-lg font-bold">Assessment Complete</h3>
        <p className="text-sm text-muted-foreground my-4">
          All adaptive rounds completed. Generating your diagnostic breakdown.
        </p>
        <Button onClick={handleFinish} variant="gradient">
          View Results
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header bar with timer and question progress */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-foreground">
            Question {questionNumber} of 5
          </span>
          <Badge
            variant={
              question.difficulty === "hard"
                ? "destructive"
                : question.difficulty === "medium"
                ? "warning"
                : "success"
            }
            className="capitalize text-[10px]"
          >
            {question.difficulty} Difficulty
          </Badge>
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
            {question.topic}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-300 bg-secondary/80 px-3 py-1 rounded-full border border-border/60">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>{formatTime(timeSeconds)}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFinish}
            className="text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
          >
            End Test
          </Button>
        </div>
      </div>

      <Progress value={(questionNumber / 5) * 100} className="h-1.5" />

      {/* Main Question Card */}
      <Card className="border-border/80 bg-card/90 backdrop-blur-xl shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="default" className="text-xs uppercase tracking-wider">
              {question.type} format
            </Badge>

            {question.companyTags && question.companyTags.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 text-purple-400" />
                <span>Frequently asked at:</span>
                <span className="font-semibold text-purple-300">
                  {question.companyTags.join(", ")}
                </span>
              </div>
            )}
          </div>

          <CardTitle className="text-base sm:text-lg leading-relaxed text-slate-100 font-medium">
            {question.content.prompt}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* MCQ Options */}
          {question.content.options && question.content.options.length > 0 && (
            <div className="space-y-3">
              {question.content.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={feedback !== null}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-primary/15 border-primary text-slate-100 shadow-md ring-1 ring-primary/50"
                        : "bg-secondary/30 border-border/70 text-slate-300 hover:bg-secondary/60 hover:text-white"
                    } ${feedback !== null ? "cursor-default" : ""}`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 border ${
                        isSelected
                          ? "bg-primary text-white border-primary"
                          : "border-border/80 text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-normal">{option}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Coding Challenge Interface */}
          {question.type === "coding" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-400" />
                  <span className="font-mono font-medium">JavaScript Solution</span>
                </div>
                <span className="text-[11px]">Tab indentation supported</span>
              </div>

              <Textarea
                value={codeAnswer}
                onChange={(e) => setCodeAnswer(e.target.value)}
                disabled={feedback !== null}
                className="font-mono text-xs sm:text-sm min-h-[220px] bg-black/50 text-emerald-300 border-border/80 p-4 rounded-xl"
              />

              {question.content.testCases && (
                <div className="p-3 rounded-xl bg-secondary/40 border border-border/50 text-xs space-y-2">
                  <span className="font-semibold text-slate-300 block">Sample Test Cases:</span>
                  {question.content.testCases.map((tc, idx) => (
                    <div key={idx} className="font-mono text-[11px] text-muted-foreground">
                      Input: <span className="text-slate-200">{tc.input}</span> ➔ Output:{" "}
                      <span className="text-blue-300">{tc.output}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hint Disclosure */}
          {question.content.hint && (
            <div>
              {showHint ? (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Hint:</span>
                    <span>{question.content.hint}</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowHint(true)}
                  className="text-xs text-muted-foreground hover:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Need a hint? (Does not affect score)</span>
                </button>
              )}
            </div>
          )}

          {/* Feedback Display */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm animate-in fade-in zoom-in-95 flex items-start gap-3 ${
                feedback.isCorrect
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-200"
              }`}
            >
              {feedback.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold block">
                  {feedback.isCorrect ? "Correct Solution!" : "Incorrect Solution"}
                </span>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {feedback.feedback}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-xs text-muted-foreground">
            Adaptive Difficulty: auto-tunes each round
          </span>

          {!feedback ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={
                submitting ||
                (question.type !== "coding" && !selectedOption) ||
                (question.type === "coding" && !codeAnswer.trim())
              }
              variant="gradient"
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Submit Answer</span>
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              variant="default"
              className="gap-2 bg-blue-600 hover:bg-blue-500 text-white"
            >
              <span>{questionNumber >= 5 ? "Finish Diagnostic" : "Next Question"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
