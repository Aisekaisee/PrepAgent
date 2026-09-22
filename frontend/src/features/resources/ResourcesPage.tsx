import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ExternalLink,
  Bookmark,
  Building2,
  Code2,
  FileText,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { resourcesApi } from "./api/resourcesApi";
import type { Resource } from "@/types/resource";

export function ResourcesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await resourcesApi.getResources({
          topic: initialTopic || undefined,
          difficulty: selectedDifficulty,
          type: selectedType,
          search: search || undefined,
        });
        setResources(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialTopic, selectedDifficulty, selectedType, search]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const clearTopicFilter = () => {
    searchParams.delete("topic");
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Curated Practice & Resource Bank"
        description="High-yield interview problems, system design blueprints, and technical deep-dives mapped directly to company interview rubrics."
        action={
          initialTopic ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clearTopicFilter}
              className="text-xs gap-1"
            >
              <span>Showing: {initialTopic}</span>
              <span className="ml-1 text-muted-foreground">✕</span>
            </Button>
          ) : undefined
        }
      />

      {/* Filter and Search Controls */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources, topics, algorithms, or companies (e.g. Google, DP, LRU)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-secondary/60 border border-border/80 text-xs rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Content Types</option>
              <option value="problem">Coding Problems</option>
              <option value="article">Technical Articles</option>
              <option value="question">Interview Questions</option>
            </select>

            {/* Difficulty selector */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-secondary/60 border border-border/80 text-xs rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <p className="text-sm">No resources match your current filter parameters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelectedDifficulty("all");
              setSelectedType("all");
              clearTopicFilter();
            }}
            className="mt-4 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res) => {
            const isBookmarked = bookmarkedIds.includes(res.id);
            return (
              <Card
                key={res.id}
                className="hover:border-border transition-all duration-200 flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          res.type === "problem"
                            ? "default"
                            : res.type === "article"
                            ? "purple"
                            : "outline"
                        }
                        className="text-[10px] capitalize gap-1"
                      >
                        {res.type === "problem" && <Code2 className="h-3 w-3" />}
                        {res.type === "article" && <FileText className="h-3 w-3" />}
                        {res.type === "question" && <HelpCircle className="h-3 w-3" />}
                        <span>{res.type}</span>
                      </Badge>
                      <Badge
                        variant={
                          res.difficulty === "hard"
                            ? "destructive"
                            : res.difficulty === "medium"
                            ? "warning"
                            : "success"
                        }
                        className="text-[10px] capitalize"
                      >
                        {res.difficulty}
                      </Badge>
                    </div>

                    <button
                      onClick={() => toggleBookmark(res.id)}
                      className="text-muted-foreground hover:text-amber-400 transition-colors p-1 cursor-pointer"
                      title="Bookmark resource"
                    >
                      <Bookmark
                        className={`h-4 w-4 ${
                          isBookmarked ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <CardTitle className="text-base font-bold text-slate-100 mt-2 line-clamp-1">
                    {res.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {res.content}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-[11px]">
                        {res.companyTags.slice(0, 3).join(", ")}
                      </span>
                    </div>

                    {res.url ? (
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                      >
                        <span>Open Resource</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Practice In-App</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
