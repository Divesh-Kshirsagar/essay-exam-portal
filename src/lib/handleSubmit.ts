import { hasAlreadySubmitted } from "./firestore";

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
  
      // Submit to Backend API
      const response = await fetch('http://localhost:3001/api/submit-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: data.rollNumber,
          name: data.name,
          essay: data.essay,
          topic: data.topic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit essay to backend');
      }

      await response.json();

      return {
        status: "success",
        data: {
          score: 0,
          feedback: "Essay submitted! Check the leaderboard for your result shortly.",
          checkpoints: {} as any,
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
