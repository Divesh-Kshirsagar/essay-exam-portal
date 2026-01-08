"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react";

  interface SubmitButtonProps {
    onClick: () => void;
    isSubmitting: boolean;
    isDisabled: boolean;
    wordCount: number;
    minWords?: number;
    maxWords?: number;
  }
  
  export function SubmitButton({
    onClick,
    isSubmitting,
    isDisabled,
    wordCount,
    minWords = 100,
    maxWords = 300,
  }: SubmitButtonProps) {
    const isValidLength = wordCount >= minWords && wordCount <= maxWords;
    const hasContent = wordCount > 0;
  
    const getButtonState = () => {
      if (isSubmitting) {
        return {
          text: "Grading in Progress...",
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          className: "bg-primary/50 cursor-not-allowed",
        };
      }
      if (!hasContent) {
        return {
          text: "Write your essay first",
          icon: <AlertCircle className="w-5 h-5" />,
          className: "bg-muted cursor-not-allowed opacity-50",
        };
      }
      if (!isValidLength && wordCount < minWords) {
        return {
          text: `${minWords - wordCount} more words needed`,
          icon: <AlertCircle className="w-5 h-5" />,
          className: "bg-amber-500/80 hover:bg-amber-500",
        };
      }
      if (!isValidLength && wordCount > maxWords) {
        return {
          text: "Exceeds word limit",
          icon: <AlertCircle className="w-5 h-5" />,
          className: "bg-red-500/80 hover:bg-red-500",
        };
      }
    return {
      text: "Submit Essay",
      icon: <Send className="w-5 h-5" />,
      className:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25",
    };
  };

  const state = getButtonState();

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled || isSubmitting || !hasContent}
      size="lg"
      className={`
        w-full gap-3 py-6 text-lg font-semibold
        transition-all duration-300 transform
        hover:scale-[1.02] active:scale-[0.98]
        ${state.className}
      `}
    >
      {state.icon}
      {state.text}
      {isValidLength && !isSubmitting && (
        <CheckCircle2 className="w-4 h-4 ml-1" />
      )}
    </Button>
  );
}
