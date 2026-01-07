"use client";

import { useEffect, useRef, useCallback } from "react";
import { saveEssayProgress } from "@/lib/firestore";

const AUTOSAVE_INTERVAL = 30000; // 30 seconds

/**
 * Hook for progressive auto-save to Firestore with dirty check
 * Only saves when content has actually changed
 */
export function useFirestoreAutosave(
  rollNumber: string,
  essay: string,
  focusLossCount: number,
  isEnabled: boolean
) {
  // Track the last saved state for dirty check
  const lastSavedEssay = useRef<string>("");
  const lastSavedFocusCount = useRef<number>(0);
  const isSaving = useRef<boolean>(false);

  // Check if there are unsaved changes
  const isDirty = useCallback(() => {
    return (
      essay !== lastSavedEssay.current ||
      focusLossCount !== lastSavedFocusCount.current
    );
  }, [essay, focusLossCount]);

  // Save function
  const saveNow = useCallback(async () => {
    if (!rollNumber || !isEnabled || isSaving.current) return;
    if (!isDirty()) return; // Skip if no changes

    isSaving.current = true;
    try {
      await saveEssayProgress(rollNumber, essay, focusLossCount);
      lastSavedEssay.current = essay;
      lastSavedFocusCount.current = focusLossCount;
      console.log("[Autosave] Essay saved to Firestore");
    } catch (error) {
      console.error("[Autosave] Failed to save:", error);
    } finally {
      isSaving.current = false;
    }
  }, [rollNumber, essay, focusLossCount, isEnabled, isDirty]);

  // Auto-save interval
  useEffect(() => {
    if (!isEnabled || !rollNumber) return;

    const interval = setInterval(() => {
      if (isDirty()) {
        saveNow();
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [isEnabled, rollNumber, isDirty, saveNow]);

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty() && rollNumber && isEnabled) {
        // Attempt sync save on unmount (best effort)
        saveEssayProgress(rollNumber, essay, focusLossCount).catch(console.error);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    saveNow,
    isDirty: isDirty(),
    lastSavedAt: lastSavedEssay.current ? new Date() : null,
  };
}
