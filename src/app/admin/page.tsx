"use client";

import { useState, useEffect } from "react";
import { useExam } from "@/context/ExamContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Settings,
  Database,
  Clock,
  Layers,
  BookOpen,
  RefreshCw,
  Save,
  LogOut,
  Plus,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface ResultItem {
  rollNumber: string;
  category: string;
  topic: string;
  score: number;
  focusLossCount: number;
  submittedAt: string;
  essay: string;
}

export default function AdminPage() {
  const { config, updateConfig } = useExam();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Config state
  const [categories, setCategories] = useState<string[]>([]);
  const [topics, setTopics] = useState<Record<string, string[]>>({});
  const [examDuration, setExamDuration] = useState(60);
  const [newCategory, setNewCategory] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Results state
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultError, setResultError] = useState("");

  // Notification state
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize state from context
  useEffect(() => {
    setCategories([...config.categories]);
    setTopics({ ...config.topics });
    setExamDuration(config.examDurationMinutes);
    if (config.categories.length > 0) {
      setSelectedCategory(config.categories[0]);
    }
  }, [config]);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (in production, use proper auth)
    if (password === (process.env.ADMIN_PASSWORD || "admin123")) {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid password");
    }
  };

  // Add category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) return;

    const cat = newCategory.trim();
    setCategories([...categories, cat]);
    setTopics({ ...topics, [cat]: [] });
    setNewCategory("");
    setSelectedCategory(cat);
  };

  // Remove category
  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat));
    const newTopics = { ...topics };
    delete newTopics[cat];
    setTopics(newTopics);
    if (selectedCategory === cat && categories.length > 1) {
      setSelectedCategory(categories.find((c) => c !== cat) || "");
    }
  };

  // Add topic
  const handleAddTopic = () => {
    if (!newTopic.trim() || !selectedCategory) return;
    const currentTopics = topics[selectedCategory] || [];
    if (currentTopics.includes(newTopic.trim())) return;

    setTopics({
      ...topics,
      [selectedCategory]: [...currentTopics, newTopic.trim()],
    });
    setNewTopic("");
  };

  // Remove topic
  const handleRemoveTopic = (topic: string) => {
    if (!selectedCategory) return;
    setTopics({
      ...topics,
      [selectedCategory]: topics[selectedCategory].filter((t) => t !== topic),
    });
  };

  // Save config
  const handleSaveConfig = () => {
    updateConfig({
      categories,
      topics,
      examDurationMinutes: examDuration,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Fetch results
  const handleFetchResults = async () => {
    setIsLoadingResults(true);
    setResultError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_GAS_URL;
      if (!apiUrl || apiUrl === "YOUR_GAS_URL") {
        // Demo data for testing
        setResults([
          {
            rollNumber: "12345678",
            category: "Section A",
            topic: "The Impact of Technology on Education",
            score: 8,
            focusLossCount: 2,
            submittedAt: new Date().toISOString(),
            essay: "Sample essay text...",
          },
          {
            rollNumber: "87654321",
            category: "AIML",
            topic: "Ethics in Artificial Intelligence",
            score: 9,
            focusLossCount: 0,
            submittedAt: new Date().toISOString(),
            essay: "Another sample essay...",
          },
        ]);
      } else {
        const response = await fetch(`${apiUrl}?action=getResults`);
        const data = await response.json();
        if (data.status === "success") {
          setResults(data.data || []);
        } else {
          setResultError(data.error || "Failed to fetch results");
        }
      }
    } catch (error) {
      setResultError("Failed to connect to server");
      console.error(error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Export results
  const handleExportResults = () => {
    const csv = [
      "Roll Number,Category,Topic,Score,Focus Loss,Submitted At",
      ...results.map(
        (r) =>
          `${r.rollNumber},${r.category},"${r.topic}",${r.score},${r.focusLossCount},${r.submittedAt}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exam-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/20">
              <Shield className="w-10 h-10 text-red-400" />
            </div>
            <CardTitle className="text-xl">Admin Access</CardTitle>
            <CardDescription>Enter password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
              />
              {authError && (
                <p className="text-sm text-red-400 text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {authError}
                </p>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <div className="mt-4 text-center">
              <a
                href="/login"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to Student Login
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage exam configuration and view results
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsAuthenticated(false)}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Categories & Topics */}
          <Card className="bg-card/80 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Categories & Topics
              </CardTitle>
              <CardDescription>Manage exam sections and essay topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Category */}
              <div className="flex gap-2">
                <Input
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={handleAddCategory} size="icon" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Category List */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer group"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCategory(cat);
                      }}
                      className="ml-1 opacity-50 hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Topics for selected category */}
              {selectedCategory && (
                <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30">
                  <Label className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4" />
                    Topics for {selectedCategory}
                  </Label>

                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="New topic"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                    />
                    <Button onClick={handleAddTopic} size="icon" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(topics[selectedCategory] || []).map((topic) => (
                      <div
                        key={topic}
                        className="flex items-center justify-between p-2 rounded bg-background/50"
                      >
                        <span className="text-sm truncate">{topic}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveTopic(topic)}
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                    ))}
                    {(topics[selectedCategory] || []).length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No topics added yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exam Settings */}
          <Card className="bg-card/80 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Exam Settings
              </CardTitle>
              <CardDescription>Configure exam duration and parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Exam Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  max={180}
                  value={examDuration}
                  onChange={(e) => setExamDuration(parseInt(e.target.value) || 60)}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                <h4 className="text-sm font-semibold mb-2">Current Configuration</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Categories: {categories.length}</li>
                  <li>
                    • Total Topics:{" "}
                    {Object.values(topics).reduce((sum, arr) => sum + arr.length, 0)}
                  </li>
                  <li>• Duration: {examDuration} minutes</li>
                </ul>
              </div>

              <Button onClick={handleSaveConfig} className="w-full gap-2">
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <Card className="bg-card/80 backdrop-blur-xl border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Exam Results
                </CardTitle>
                <CardDescription>View and export student submissions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleFetchResults}
                  disabled={isLoadingResults}
                  className="gap-2"
                >
                  {isLoadingResults ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Fetch Results
                </Button>
                {results.length > 0 && (
                  <Button variant="outline" onClick={handleExportResults} className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {resultError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
                {resultError}
              </div>
            )}

            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No results yet. Click &ldquo;Fetch Results&rdquo; to load data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2 px-3">Roll No.</th>
                      <th className="text-left py-2 px-3">Category</th>
                      <th className="text-left py-2 px-3">Topic</th>
                      <th className="text-center py-2 px-3">Score</th>
                      <th className="text-center py-2 px-3">Tab Switches</th>
                      <th className="text-left py-2 px-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/30 hover:bg-muted/20"
                      >
                        <td className="py-2 px-3 font-mono">{result.rollNumber}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline">{result.category}</Badge>
                        </td>
                        <td className="py-2 px-3 max-w-[200px] truncate">
                          {result.topic}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge
                            className={
                              result.score >= 8
                                ? "bg-emerald-500/20 text-emerald-400"
                                : result.score >= 6
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-red-500/20 text-red-400"
                            }
                          >
                            {result.score}/10
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <Badge
                            variant="outline"
                            className={
                              result.focusLossCount > 0
                                ? "border-amber-500/30 text-amber-400"
                                : "border-emerald-500/30 text-emerald-400"
                            }
                          >
                            {result.focusLossCount}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {new Date(result.submittedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
