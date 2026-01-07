import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

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

/**
 * Grade an essay using Gemini AI
 */
export async function gradeEssay(
  essay: string,
  topic: string,
  charCount: number
): Promise<GradeResult> {
  console.log("Initializing Gemini with model: gemini-pro");
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse grading response");
    }

    const gradeData = JSON.parse(jsonMatch[0]) as GradeResult;

    // Validate and sanitize
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
    console.error("Gemini grading error:", error);

    // Return fallback grade if AI fails
    return {
      score: 5,
      feedback: "Essay received. Manual review may be required.",
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
