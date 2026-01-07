"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

export function Timer({ initialMinutes, onTimeUp }: TimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const newValue = prev - 1;
        if (newValue <= 300 && !isWarning) {
          setIsWarning(true);
        }
        if (newValue <= 0) {
          onTimeUp();
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, onTimeUp, isWarning]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
        isWarning
          ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 animate-pulse"
          : "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
      }`}
    >
      {isWarning ? (
        <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
      ) : (
        <Clock className="w-6 h-6 text-primary" />
      )}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Time Remaining
        </span>
        <span
          className={`text-2xl font-mono font-bold tabular-nums ${
            isWarning ? "text-red-500" : "text-foreground"
          }`}
        >
          {formatTime(secondsRemaining)}
        </span>
      </div>
    </div>
  );
}
