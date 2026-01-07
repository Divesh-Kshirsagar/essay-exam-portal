"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Maximize } from "lucide-react";

interface FullscreenWarningProps {
  isOpen: boolean;
  onDismiss: () => void;
  onReenterFullscreen: () => void;
}

export function FullscreenWarning({
  isOpen,
  onDismiss,
  onReenterFullscreen,
}: FullscreenWarningProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-amber-950/50 to-card border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
            Fullscreen Mode Exited
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You have exited fullscreen mode. This action has been recorded. For
            the best exam experience, please re-enter fullscreen mode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-300/80">
              ⚠️ Exiting fullscreen mode during an exam may be flagged as
              suspicious activity. Your proctor has been notified.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-border/50"
              onClick={onDismiss}
            >
              Continue Anyway
            </Button>
            <Button
              className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => {
                onReenterFullscreen();
                onDismiss();
              }}
            >
              <Maximize className="w-4 h-4" />
              Re-enter Fullscreen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
