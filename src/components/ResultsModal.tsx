"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
} from "lucide-react";
import type { APIResponse } from "@/lib/handleSubmit";

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: APIResponse | null;
}

export function ResultsModal({ isOpen, onClose, result }: ResultsModalProps) {
  if (!result) return null;

  const isSuccess = result.status === "success" && result.data;
  const score = result.data?.score ?? 0;
  const feedback = result.data?.feedback ?? "";
  const checkpoints = result.data?.checkpoints ?? {};

  const getScoreColor = (s: number) => {
    if (s >= 8) return "text-emerald-400";
    if (s >= 6) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreGradient = (s: number) => {
    if (s >= 8) return "from-emerald-500/20 to-emerald-500/5";
    if (s >= 6) return "from-amber-500/20 to-amber-500/5";
    return "from-red-500/20 to-red-500/5";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-card to-card/95 border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isSuccess ? (
              <>
                <Trophy className="w-6 h-6 text-amber-400" />
                Submission Results
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Submission Error
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Your essay has been graded successfully"
              : "There was a problem with your submission"}
          </DialogDescription>
        </DialogHeader>

        {isSuccess && result.data ? (
          <div className="space-y-6 py-4">
            {/* Score Display / Status */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/5 border border-blue-500/30 text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                Status
              </p>
              <div className="flex flex-col items-center justify-center gap-2">
                <span className="text-2xl font-bold text-blue-400">
                  Submission Received
                </span>
                <p className="text-sm text-muted-foreground">
                  Your essay is being graded.
                </p>
                <div className="mt-4">
                  <a 
                    href="/leaderboard" 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-sm"
                  >
                    View Leaderboard
                  </a>
                </div>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Feedback</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feedback}
                </p>
              </div>
            )}

            {/* Checkpoints */}
            {Object.keys(checkpoints).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">
                    Grading Checkpoints
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(checkpoints).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20"
                    >
                      <span className="text-sm capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {String(value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  // Download receipt logic
                  // Download receipt logic
                  const receipt = {
                    status: "Submitted",
                    score: "Pending", // Score is pending
                    feedback: feedback || "Pending evaluation",
                    timestamp: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(receipt, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "exam-receipt.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </Button>
              <Button className="flex-1 gap-2" onClick={onClose}>
                <X className="w-4 h-4" />
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">
                {result.error || "An unexpected error occurred"}
              </p>
            </div>
            <Button className="w-full" onClick={onClose}>
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
