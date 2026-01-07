"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with server-side API key (or public one if that's what's set)
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
console.log("API Key loaded:", apiKey ? `YES (length: ${apiKey.length})` : "NO ❌");
const genAI = new GoogleGenerativeAI(apiKey);

export interface GradeResult {
  score: number;
  feedback: string;
  checkpoints: {
    grammar: number;
    coherence: number;
    topicRelevance: number;
    creativity: number;
    structure: number;
  };
}

export async function gradeEssayAction(
  essay: string,
  topic: string,
  charCount: number
): Promise<GradeResult> {
  console.log("Server Action: Grading essay with gemini-2.5-flash-lite...");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `You are an essay grading assistant. Grade the following essay on a scale of 1-10.

Topic: "${topic}"
Character Count: ${charCount} characters (Required: 1000-5000 characters)

Essay:
"""
${essay}
"""

Provide your evaluation in the following JSON format ONLY (no additional text):
{
  "score": <number 1-10>,
  "feedback": "<2-3 sentence constructive feedback>",
  "checkpoints": {
    "grammar": <number 1-10>,
    "coherence": <number 1-10>,
    "topicRelevance": <number 1-10>,
    "creativity": <number 1-10>,
    "structure": <number 1-10>
  }
}

Consider:
- Grammar and spelling (grammar)
- Logical flow and coherence (coherence)
- Relevance to the given topic (topicRelevance)
- Originality and creativity (creativity)
- Essay structure and organization (structure)
- Character count compliance (penalize if outside 1000-5000 range)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse grading response");
    }

    const gradeData = JSON.parse(jsonMatch[0]) as GradeResult;

    return {
      score: Math.max(1, Math.min(10, Math.round(gradeData.score))),
      feedback: gradeData.feedback || "Essay graded successfully.",
      checkpoints: {
        grammar: Math.max(1, Math.min(10, gradeData.checkpoints?.grammar || 5)),
        coherence: Math.max(1, Math.min(10, gradeData.checkpoints?.coherence || 5)),
        topicRelevance: Math.max(1, Math.min(10, gradeData.checkpoints?.topicRelevance || 5)),
        creativity: Math.max(1, Math.min(10, gradeData.checkpoints?.creativity || 5)),
        structure: Math.max(1, Math.min(10, gradeData.checkpoints?.structure || 5)),
      },
    };
  } catch (error) {
    console.error("Gemini Server Action Error:", error);
    // Return fallback to prevent complete failure
    return {
      score: 5,
      feedback: `AI grading failed: ${error instanceof Error ? error.message : String(error)}. (Manual Review Required)`,
      checkpoints: {
        grammar: 5,
        coherence: 5,
        topicRelevance: 5,
        creativity: 5,
        structure: 5,
      },
    };
  }
}
