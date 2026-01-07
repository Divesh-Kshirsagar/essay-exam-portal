import { saveSubmission, hasAlreadySubmitted, type SubmissionInput } from "./firestore";
import { gradeEssayAction } from "@/app/actions/gradeEssay";

  export interface SubmitData {
    essay: string;
    rollNumber: string;
    name: string;
    focusLossCount: number;
    category: string;
    topic: string;
    charCount: number;
    minCharCount?: number;
    maxCharCount?: number;
  }
  
  export interface APIResponse {
    status: "success" | "error";
    data?: {
      score: number;
      feedback: string;
      checkpoints: Record<string, unknown>;
    };
    error?: string;
  }
  
  /**
   * Handle essay submission:
   * 1. Check for duplicate submission
   * 2. Grade essay using Gemini AI
   * 3. Save to Firestore
   */
  export async function handleSubmit(data: SubmitData): Promise<APIResponse> {
    try {
      // Check if already submitted
      const alreadySubmitted = await hasAlreadySubmitted(data.rollNumber);
      if (alreadySubmitted) {
        return {
          status: "error",
          error: "You have already submitted an essay. Multiple submissions are not allowed.",
        };
      }
  
      // Use provided character count or calculate it
      const charCount = data.charCount || data.essay.length;
      const minChar = data.minCharCount || 1000;
      const maxChar = data.maxCharCount || 5000;
      const wordCount = data.essay.trim() ? data.essay.trim().split(/\s+/).length : 0;
  
      // Validate character count
      if (charCount < minChar) {
        return {
          status: "error",
          error: `Essay must be at least ${minChar} characters. Current: ${charCount} chars.`,
        };
      }
  
      if (charCount > maxChar) {
        return {
          status: "error",
          error: `Essay must not exceed ${maxChar} characters. Current: ${charCount} chars.`,
        };
      }
  
      // Grade the essay using Gemini AI
      const gradeResult = await gradeEssayAction(data.essay, data.topic, charCount);
  
      // Save to Firestore
      const submissionInput: SubmissionInput = {
        rollNumber: data.rollNumber,
        name: data.name,
        category: data.category,
        topic: data.topic,
        essay: data.essay,
        focusLossCount: data.focusLossCount,
        charCount: charCount,
        wordCount: wordCount, // Keep saving word count for reference
      };

    await saveSubmission(submissionInput, gradeResult);

    return {
      status: "success",
      data: {
        score: gradeResult.score,
        feedback: gradeResult.feedback,
        checkpoints: gradeResult.checkpoints,
      },
    };
  } catch (error) {
    console.error("Submission failed:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Submission failed. Please try again.",
    };
  }
}
