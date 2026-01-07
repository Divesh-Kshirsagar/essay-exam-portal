"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface AntiCheatState {
  focusLossCount: number;
  isFullscreen: boolean;
  showFullscreenWarning: boolean;
}

export function useAntiCheat() {
  const [state, setState] = useState<AntiCheatState>({
    focusLossCount: 0,
    isFullscreen: false,
    showFullscreenWarning: false,
  });
  
  const hasExitedFullscreenOnce = useRef(false);

  // Focus tracking via visibilitychange
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setState((prev) => ({
          ...prev,
          focusLossCount: prev.focusLossCount + 1,
        }));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fullscreen monitoring
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!document.fullscreenElement;
      setState((prev) => ({
        ...prev,
        isFullscreen: isFS,
        showFullscreenWarning: !isFS && hasExitedFullscreenOnce.current,
      }));
      if (!isFS && hasExitedFullscreenOnce.current === false && document.fullscreenElement === null) {
        // First time entering then exiting
        hasExitedFullscreenOnce.current = true;
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      hasExitedFullscreenOnce.current = true;
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
  }, []);

  const dismissFullscreenWarning = useCallback(() => {
    setState((prev) => ({ ...prev, showFullscreenWarning: false }));
  }, []);

  return {
    focusLossCount: state.focusLossCount,
    isFullscreen: state.isFullscreen,
    showFullscreenWarning: state.showFullscreenWarning,
    enterFullscreen,
    dismissFullscreenWarning,
  };
}
