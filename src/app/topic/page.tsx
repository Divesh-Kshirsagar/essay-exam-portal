"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, Play, User, Layers } from "lucide-react";

export default function TopicSelectionPage() {
  const router = useRouter();
  const { config, session, selectTopic, startExam } = useExam();

  const [selectedTopic, setSelectedTopic] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!session.isLoggedIn) {
      router.push("/login");
    }
  }, [session.isLoggedIn, router]);

  // Get topics for selected category
  const availableTopics = config.topics[session.category] || [];

  const handleLockTopic = () => {
    if (!selectedTopic) return;
    selectTopic(selectedTopic);
    setIsLocked(true);
  };

  const handleStartExam = () => {
    startExam();
    router.push("/exam");
  };

  if (!session.isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Select Your Topic</CardTitle>
          <CardDescription className="text-muted-foreground">
            Choose an essay topic to begin
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Student Info Summary */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                Registration
              </div>
              <Badge variant="secondary" className="font-mono">
                {session.rollNumber}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="w-4 h-4" />
                Category
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {session.category}
              </Badge>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="flex items-center gap-2">
              Essay Topic
              {isLocked && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </Label>
            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
              disabled={isLocked}
            >
              <SelectTrigger
                id="topic"
                className={`${isLocked ? "opacity-70 cursor-not-allowed" : ""} ${
                  selectedTopic ? "border-emerald-500/50" : ""
                }`}
              >
                <SelectValue placeholder="Choose your essay topic" />
              </SelectTrigger>
              <SelectContent>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Lock Button */}
          {!isLocked && (
            <Button
              onClick={handleLockTopic}
              disabled={!selectedTopic}
              variant="outline"
              className="w-full gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
            >
              <Lock className="w-4 h-4" />
              Lock Topic Selection
            </Button>
          )}

          {/* Warning */}
          {!isLocked && selectedTopic && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <p className="text-xs text-amber-400">
                ⚠️ Once locked, you cannot change your topic. Make sure you have selected the correct one.
              </p>
            </div>
          )}

          {/* Start Exam Button */}
          {isLocked && (
            <Button
              onClick={handleStartExam}
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              <Play className="w-5 h-5" />
              Start Examination
            </Button>
          )}

          {isLocked && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-xs text-emerald-400 text-center">
                ✓ Topic locked: &ldquo;{selectedTopic}&rdquo;
              </p>
            </div>
          )}

          {/* Exam Info */}
          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <h4 className="text-sm font-semibold mb-2 text-foreground/80">
              Exam Details:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Duration: {config.examDurationMinutes} minutes</li>
              <li>• Word count: 100-300 words</li>
              <li>• Timer starts when you click &ldquo;Start Examination&rdquo;</li>
              <li>• Your progress will be auto-saved</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
