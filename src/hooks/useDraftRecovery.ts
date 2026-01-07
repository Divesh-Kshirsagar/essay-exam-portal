"use client";

import { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY_PREFIX = "exam_draft_";
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

interface DraftData {
  essay: string;
  timestamp: number;
}

export function useDraftRecovery(
  rollNumber: string,
  essay: string,
  setEssay: (essay: string) => void
) {
  const storageKey = `${STORAGE_KEY_PREFIX}${rollNumber || "anonymous"}`;
  const isInitialLoad = useRef(true);

  // Auto-save essay every 30 seconds
  useEffect(() => {
    if (!essay.trim()) return;

    const interval = setInterval(() => {
      const draftData: DraftData = {
        essay,
        timestamp: Date.now(),
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(draftData));
      } catch (err) {
        console.error("Failed to save draft:", err);
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [essay, storageKey]);

  // Restore draft on initial load
  useEffect(() => {
    if (!isInitialLoad.current) return;
    isInitialLoad.current = false;

    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const draftData: DraftData = JSON.parse(savedDraft);
        const ageMinutes = (Date.now() - draftData.timestamp) / 60000;
        
        // Only restore drafts from the last 24 hours
        if (ageMinutes < 1440 && draftData.essay.trim()) {
          const shouldRestore = window.confirm(
            `Found a saved draft from ${Math.round(ageMinutes)} minutes ago. Would you like to restore it?`
          );
          if (shouldRestore) {
            setEssay(draftData.essay);
          } else {
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (err) {
      console.error("Failed to restore draft:", err);
    }
  }, [storageKey, setEssay]);

  // Save immediately (for manual trigger)
  const saveDraftNow = useCallback(() => {
    const draftData: DraftData = {
      essay,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(draftData));
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  }, [essay, storageKey]);

  // Clear draft on successful submission
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.error("Failed to clear draft:", err);
    }
  }, [storageKey]);

  return { saveDraftNow, clearDraft };
}
