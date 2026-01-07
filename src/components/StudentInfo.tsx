"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, User, Eye, EyeOff } from "lucide-react";

interface StudentInfoProps {
  rollNumber: string;
  setRollNumber: (value: string) => void;
  focusLossCount: number;
  isLocked: boolean;
}

export function StudentInfo({
  rollNumber,
  setRollNumber,
  focusLossCount,
  isLocked,
}: StudentInfoProps) {
  return (
    <div className="space-y-4">
      {/* Exam Title */}
      <div className="pb-4 border-b border-border/50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Essay Examination
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          100-300 words required
        </p>
      </div>

      {/* Roll Number Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          Roll Number
        </label>
        <Input
          type="text"
          placeholder="Enter your roll number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          disabled={isLocked}
          className="bg-background/50 border-border/50 focus:border-primary transition-all"
        />
      </div>

      {/* Focus Loss Counter */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          {focusLossCount > 0 ? (
            <EyeOff className="w-4 h-4 text-amber-500" />
          ) : (
            <Eye className="w-4 h-4 text-emerald-500" />
          )}
          Tab Switches
        </label>
        <div className="flex items-center gap-2">
          <Badge
            variant={focusLossCount > 0 ? "destructive" : "secondary"}
            className={`text-lg px-3 py-1 ${
              focusLossCount > 0
                ? "bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-400 border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {focusLossCount}
          </Badge>
          {focusLossCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <AlertTriangle className="w-3 h-3" />
              <span>Recorded</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Tab switches are logged and reported
        </p>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 rounded-lg bg-muted/30 border border-border/30">
        <h3 className="text-sm font-semibold mb-2 text-foreground/90">
          Instructions
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Write an essay between 100-300 words</li>
          <li>• Do not switch tabs or windows</li>
          <li>• Copy/paste is disabled</li>
          <li>• Right-click is disabled</li>
          <li>• Use fullscreen mode for best experience</li>
        </ul>
      </div>
    </div>
  );
}
