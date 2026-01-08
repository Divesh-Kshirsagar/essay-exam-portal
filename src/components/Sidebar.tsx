"use client";

import { Button } from "@/components/ui/button";
import { Timer } from "./Timer";
import { StudentInfo } from "./StudentInfo";
import { Maximize, Minimize, Menu, X } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  rollNumber: string;
  setRollNumber: (value: string) => void;
  focusLossCount: number;
  isFullscreen: boolean;
  onEnterFullscreen: () => void;
  onTimeUp: () => void;
  examDurationMinutes: number;
  isLocked: boolean;
  category?: string;
  isStopped?: boolean;
}

export function Sidebar({
  rollNumber,
  setRollNumber,
  focusLossCount,
  isFullscreen,
  onEnterFullscreen,
  onTimeUp,
  examDurationMinutes,
  isLocked,
  category,
  isStopped = false,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-lg"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen z-40
          w-72 lg:w-80 p-4 lg:p-6
          bg-gradient-to-b from-card via-card to-card/95
          border-r border-border/50
          flex flex-col gap-6
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent
        `}
      >
        {/* Timer */}
        <Timer initialMinutes={examDurationMinutes} onTimeUp={onTimeUp} isStopped={isStopped} />

        {/* Student Info */}
        <StudentInfo
          rollNumber={rollNumber}
          setRollNumber={setRollNumber}
          focusLossCount={focusLossCount}
          isLocked={isLocked}
        />

        {/* Fullscreen Button */}
        <div className="mt-auto">
          <Button
            onClick={onEnterFullscreen}
            variant="outline"
            className={`w-full gap-2 transition-all ${
              isFullscreen
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-primary/10 border-primary/30 hover:bg-primary/20"
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize className="w-4 h-4" />
                Fullscreen Active
              </>
            ) : (
              <>
                <Maximize className="w-4 h-4" />
                Enter Fullscreen
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Esc to exit fullscreen
          </p>
        </div>
      </aside>
    </>
  );
}
