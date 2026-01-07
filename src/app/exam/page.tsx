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
import { useFirestoreAutosave } from "@/hooks/useFirestoreAutosave";
import { handleSubmit, type APIResponse } from "@/lib/handleSubmit";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Cloud, CloudOff } from "lucide-react";

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

  // Draft recovery (localStorage backup)
  const { clearDraft } = useDraftRecovery(session.rollNumber, essay, setEssay);

  // Firestore autosave with dirty check (every 30 seconds)
  const { isDirty } = useFirestoreAutosave(
    session.rollNumber,
    essay,
    focusLossCount,
    session.examStarted && !isSubmitted
  );

  // Calculate character count
  const charCount = essay.length;
  // Character count validation based on config
  const isValidLength = charCount >= config.minCharCount && charCount <= config.maxCharCount;

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
        charCount, // Pass character count
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

        {/* Topic Display with Autosave Status */}
        <div className="max-w-4xl mx-auto w-full mb-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Topic:</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {session.topic}
              </Badge>
            </div>
            {/* Autosave Status */}
            <div className="flex items-center gap-1 text-xs">
              {isDirty ? (
                <span className="flex items-center gap-1 text-amber-400">
                  <CloudOff className="w-3 h-3" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Cloud className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editor Container */}
        <div className="flex-1 max-w-4xl mx-auto w-full">
          <Editor
            essay={essay}
            setEssay={setEssay}
            isDisabled={isSubmitted || isSubmitting}
            minCharCount={config.minCharCount}
            maxCharCount={config.maxCharCount}
          />
        </div>

        {/* Submit Area */}
        <div className="max-w-4xl mx-auto w-full mt-6">
          <SubmitButton
            onClick={handleSubmitClick}
            isSubmitting={isSubmitting}
            isDisabled={isSubmitted || !isValidLength}
            charCount={charCount}
            minCharCount={config.minCharCount}
            maxCharCount={config.maxCharCount}
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
