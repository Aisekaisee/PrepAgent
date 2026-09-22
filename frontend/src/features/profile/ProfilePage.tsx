import { useState, useEffect } from "react";
import {
  GraduationCap,
  Code2,
  BookOpen,
  Building2,
  Calendar,
  Save,
  CheckCircle2,
  Plus,
  X,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { profileApi } from "./api/profileApi";
import type { Profile } from "@/types/profile";

const AVAILABLE_COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Atlassian",
  "Adobe",
  "Salesforce",
  "Oracle",
  "Goldman Sachs",
  "Flipkart",
  "Stripe",
];

const POPULAR_SKILLS = ["C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "SQL"];

const POPULAR_SUBJECTS = [
  "Data Structures & Algorithms",
  "System Design",
  "Operating Systems",
  "Database Management Systems",
  "Computer Networks",
  "Object-Oriented Design",
];

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [year, setYear] = useState(2026);
  const [skills, setSkills] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [timelineWeeks, setTimelineWeeks] = useState(8);

  const [newSkill, setNewSkill] = useState("");
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await profileApi.getProfile();
        setProfile(data);
        setDegree(data.education?.degree || "");
        setInstitution(data.education?.institution || "");
        setYear(data.education?.year || 2026);
        setSkills(data.programmingSkills || []);
        setSubjects(data.technicalSubjects || []);
        setTargetCompanies(data.targetCompanies || []);
        setTimelineWeeks(data.timelineWeeks || 8);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await profileApi.updateProfile({
        education: { degree, institution, year: Number(year) },
        programmingSkills: skills,
        technicalSubjects: subjects,
        targetCompanies,
        timelineWeeks: Number(timelineWeeks),
      });
      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleCompany = (company: string) => {
    setTargetCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  const addSkill = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const addSubject = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects((prev) => [...prev, trimmed]);
      setNewSubject("");
    }
  };

  const removeSubject = (sub: string) => {
    setSubjects((prev) => prev.filter((s) => s !== sub));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Student Profile & Placement Targets"
        description="Your academic background, core skill set, and target hiring companies feed directly into our AI roadmap generator."
        action={
          <Button
            onClick={handleSave}
            variant="gradient"
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : savedSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <span>Saved & Synced!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        }
      />

      {profile?.roadmapStale && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-amber-300">
              Profile modified — Roadmap is stale
            </p>
            <p className="text-muted-foreground mt-0.5">
              You updated your skills or target companies. Re-run roadmap generation to adapt your schedule to your new goals.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education & Academic info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              <CardTitle>Academic Background</CardTitle>
            </div>
            <CardDescription>
              Your college institution, major, and expected year of graduation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Degree & Specialization</label>
              <Input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science & Engineering"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">College / University</label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. IIT Delhi, NIT Trichy, BITS Pilani"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Graduation Year</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2023}
                max={2030}
              />
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Goal Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              <CardTitle>Preparation Horizon</CardTitle>
            </div>
            <CardDescription>
              How much time do you have before interview season starts?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-300">Total Preparation Timeline</span>
                <span className="font-bold text-blue-400 text-sm">{timelineWeeks} Weeks</span>
              </div>
              <input
                type="range"
                min={2}
                max={24}
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>2 Weeks (Sprint)</span>
                <span>8 Weeks (Standard)</span>
                <span>24 Weeks (Deep Dive)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-400 shrink-0" />
              <span>
                PrepAgent AI will segment your weak topics and distribute practice across exactly <strong>{timelineWeeks} weeks</strong>.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Companies Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-400" />
              <CardTitle>Target Hiring Companies</CardTitle>
            </div>
            <Badge variant="purple" className="text-xs">
              {targetCompanies.length} Selected
            </Badge>
          </div>
          <CardDescription>
            Select companies whose interview patterns, coding problems, and hiring bars you want to benchmark against.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_COMPANIES.map((company) => {
              const selected = targetCompanies.includes(company);
              return (
                <button
                  key={company}
                  type="button"
                  onClick={() => toggleCompany(company)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 border cursor-pointer ${
                    selected
                      ? "bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-xs ring-1 ring-purple-500/40"
                      : "bg-secondary/40 text-muted-foreground border-border/60 hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {company}
                  {selected && " ✓"}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skills & Technical Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Programming Skills */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-emerald-400" />
              <CardTitle>Programming Languages</CardTitle>
            </div>
            <CardDescription>Languages you are comfortable interviewing in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              {skills.map((skill) => (
                <Badge key={skill} variant="default" className="gap-1 py-1 px-2.5">
                  <span>{skill}</span>
                  <X
                    className="h-3 w-3 hover:text-rose-400 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add custom language..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(newSkill))}
                className="h-9 text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => addSkill(newSkill)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Quick Add:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {POPULAR_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer border border-border/40"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Subjects */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <CardTitle>Core CS Subjects</CardTitle>
            </div>
            <CardDescription>Subjects to include in your assessment diagnostics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
              {subjects.map((sub) => (
                <Badge key={sub} variant="purple" className="gap-1 py-1 px-2.5">
                  <span>{sub}</span>
                  <X
                    className="h-3 w-3 hover:text-rose-400 cursor-pointer"
                    onClick={() => removeSubject(sub)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Add subject (e.g. Distributed Systems)..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubject(newSubject))}
                className="h-9 text-xs"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => addSubject(newSubject)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Quick Add:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {POPULAR_SUBJECTS.filter((s) => !subjects.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSubject(s)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer border border-border/40"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
