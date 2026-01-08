import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
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

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  data: {
    essay: string;
    topic: string;
    charCount: number;
  };
  result?: GradeResult;
  error?: string;
  position?: number;
  createdAt: number;
}

class GradingQueue {
  private queue: string[] = [];
  private jobs: Map<string, Job> = new Map();
  private processingCount = 0;
  private maxConcurrency = 5; // Adjust based on rate limits
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.startWorker();
  }

  addJob(essay: string, topic: string, charCount: number): string {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const job: Job = {
      id,
      status: "queued",
      data: { essay, topic, charCount },
      createdAt: Date.now(),
    };
    
    this.jobs.set(id, job);
    this.queue.push(id);
    this.processNext();
    
    // Cleanup old jobs periodically (simple garbage collection)
    if (this.jobs.size > 1000) {
      this.cleanup();
    }
    
    return id;
  }

  getJob(id: string): Job | undefined {
    const job = this.jobs.get(id);
    if (job && job.status === 'queued') {
      // Calculate position dynamically
      job.position = this.queue.indexOf(id) + 1;
    }
    return job;
  }

  private startWorker() {
    // Also try to process periodically in case of stuck jobs or race conditions
    if (!this.intervalId) {
      this.intervalId = setInterval(() => this.processNext(), 1000);
    }
  }

  private async processNext() {
    if (this.processingCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    if (!jobId) return;

    this.processingCount++;
    const job = this.jobs.get(jobId);
    
    if (job) {
      job.status = "processing";
      job.position = 0;
      
      try {
        job.result = await this.gradeEssay(job.data.essay, job.data.topic, job.data.charCount);
        job.status = "completed";
      } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        job.status = "failed";
        job.error = error instanceof Error ? error.message : String(error);
      }
    }

    this.processingCount--;
    // Trigger next immediately
    this.processNext();
  }

  private cleanup() {
    const now = Date.now();
    // Remove completed/failed jobs older than 1 hour
    for (const [id, job] of this.jobs.entries()) {
      if ((job.status === 'completed' || job.status === 'failed') && now - job.createdAt > 3600000) {
        this.jobs.delete(id);
      }
    }
  }

  // Actual Grading Logic (Moved from gradeEssay.ts)
  private async gradeEssay(essay: string, topic: string, charCount: number): Promise<GradeResult> {
     // Reusing the logic from the original gradeEssayAction
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

    // Add retry logic for 429 errors
    let retries = 3;
    while (retries > 0) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("Could not parse grading response");

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
        } catch (error: any) {
            if (error.status === 429 || error.message?.includes("429")) {
                console.warn(`Rate limited. Retrying... (${retries} left)`);
                await new Promise(r => setTimeout(r, 2000)); // Wait 2s
                retries--;
            } else {
                throw error;
            }
        }
    }
    throw new Error("Failed to grade essay after retries (Rate Limited).");
  }
}

// Global Singleton for development HMR
const globalForQueue = globalThis as unknown as { gradingQueue: GradingQueue };
export const gradingQueue = globalForQueue.gradingQueue || new GradingQueue();
if (process.env.NODE_ENV !== "production") globalForQueue.gradingQueue = gradingQueue;
