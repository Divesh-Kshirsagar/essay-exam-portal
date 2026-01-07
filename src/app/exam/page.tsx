"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { SubmitButton } from "@/components/SubmitButton";
import { ResultsModal } from "@/components/ResultsModal";
import { FullscreenWarning } from "@/components/FullscreenWarning";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { useDraftRecovery } from "@/hooks/useDraftRecovery";
import { handleSubmit, type APIResponse } from "@/lib/handleSubmit";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default function ExamPage() {
  const router = useRouter();
  const { config, session } = useExam();

  // Redirect if not properly authenticated
  useEffect(() => {
    if (!session.isLoggedIn) {
      router.push("/login");
    } else if (!session.topic || !session.examStarted) {
      router.push("/topic");
    }
  }, [session, router]);

  // State
  const [essay, setEssay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<APIResponse | null>(null);

  // Anti-cheat hooks
  const {
    focusLossCount,
    isFullscreen,
    showFullscreenWarning,
    enterFullscreen,
    dismissFullscreenWarning,
  } = useAntiCheat();

  // Draft recovery
  const { clearDraft } = useDraftRecovery(session.rollNumber, essay, setEssay);

  // Calculate word count
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const isValidWordCount = wordCount >= 100 && wordCount <= 300;

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (!isSubmitted) {
      handleSubmitClick();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted]);

  // Handle submit
  const handleSubmitClick = async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    try {
      const response = await handleSubmit({
        essay,
        rollNumber: session.rollNumber,
        focusLossCount,
        category: session.category,
        topic: session.topic,
      });

      setResult(response);
      setShowResults(true);
      setIsSubmitted(true);
      clearDraft();
    } catch (error) {
      console.error("Submit error:", error);
      setResult({
        status: "error",
        error: "Failed to submit. Please try again.",
      });
      setShowResults(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render until authenticated
  if (!session.isLoggedIn || !session.examStarted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      {/* Sidebar */}
      <Sidebar
        rollNumber={session.rollNumber}
        setRollNumber={() => {}} // Read-only now
        focusLossCount={focusLossCount}
        isFullscreen={isFullscreen}
        onEnterFullscreen={enterFullscreen}
        onTimeUp={handleTimeUp}
        examDurationMinutes={config.examDurationMinutes}
        isLocked={true}
        category={session.category}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 p-4 lg:p-8 flex flex-col">
        {/* Header spacing for mobile menu */}
        <div className="h-12 lg:h-0" />

        {/* Topic Display */}
        <div className="max-w-4xl mx-auto w-full mb-4">
          <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Topic:</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {session.topic}
            </Badge>
          </div>
        </div>

        {/* Editor Container */}
        <div className="flex-1 max-w-4xl mx-auto w-full">
          <Editor
            essay={essay}
            setEssay={setEssay}
            isDisabled={isSubmitted || isSubmitting}
          />
        </div>

        {/* Submit Area */}
        <div className="max-w-4xl mx-auto w-full mt-6">
          <SubmitButton
            onClick={handleSubmitClick}
            isSubmitting={isSubmitting}
            isDisabled={isSubmitted || !isValidWordCount}
            wordCount={wordCount}
          />
        </div>
      </main>

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        result={result}
      />

      {/* Fullscreen Warning */}
      <FullscreenWarning
        isOpen={showFullscreenWarning}
        onDismiss={dismissFullscreenWarning}
        onReenterFullscreen={enterFullscreen}
      />
    </div>
  );
}
