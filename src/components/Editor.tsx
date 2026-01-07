"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";

interface EditorProps {
  essay: string;
  setEssay: (value: string) => void;
  isDisabled: boolean;
}

export function Editor({ essay, setEssay, isDisabled }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.max(400, textarea.scrollHeight) + "px";
    }
  }, [essay]);

  // Calculate word count
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const isValidWordCount = wordCount >= 100 && wordCount <= 300;
  const isUnderMin = wordCount < 100;
  const isOverMax = wordCount > 300;

  // Block paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  // Block right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="flex flex-col h-full"
      onContextMenu={handleContextMenu}
      style={{ userSelect: "none" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Essay</h2>
        </div>
        <Badge
          variant="outline"
          className={`
            px-3 py-1 font-mono text-sm transition-all
            ${isValidWordCount ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : ""}
            ${isUnderMin ? "bg-amber-500/20 border-amber-500/30 text-amber-400" : ""}
            ${isOverMax ? "bg-red-500/20 border-red-500/30 text-red-400" : ""}
          `}
        >
          {wordCount} / 100-300 words
          {isValidWordCount && <CheckCircle2 className="w-3 h-3 ml-1 inline" />}
          {(isUnderMin || isOverMax) && (
            <AlertCircle className="w-3 h-3 ml-1 inline" />
          )}
        </Badge>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          onPaste={handlePaste}
          onContextMenu={handleContextMenu}
          disabled={isDisabled}
          placeholder="Start writing your essay here..."
          className={`
            w-full min-h-[400px] p-6
            text-base leading-relaxed
            resize-none
            bg-card/50 backdrop-blur-sm
            border-2 border-border/50
            rounded-xl
            focus:border-primary/50 focus:ring-2 focus:ring-primary/20
            transition-all duration-300
            placeholder:text-muted-foreground/50
            [&::-webkit-scrollbar]:w-2
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-border
            [&::-webkit-scrollbar-thumb]:rounded-full
          `}
          style={{
            userSelect: "text", // Allow text selection in textarea for editing
            WebkitUserSelect: "text",
          }}
        />

        {/* Word count guidance */}
        <div className="absolute bottom-4 right-4 pointer-events-none">
          {isUnderMin && (
            <p className="text-xs text-amber-500/70">
              {100 - wordCount} more words needed
            </p>
          )}
          {isOverMax && (
            <p className="text-xs text-red-500/70">
              {wordCount - 300} words over limit
            </p>
          )}
        </div>
      </div>

      {/* Anti-cheat notice */}
      <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          🔒 Copy, paste, and right-click are disabled for exam integrity
        </p>
      </div>
    </div>
  );
}
