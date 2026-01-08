"use server";

import { gradingQueue, type Job } from "@/lib/gradingQueue";

export async function checkGradingStatus(jobId: string): Promise<Job | undefined> {
  const job = gradingQueue.getJob(jobId);
  return job; // Includes status, result, error, position
}
