export interface SubmitData {
  essay: string;
  rollNumber: string;
  focusLossCount: number;
  category: string;
  topic: string;
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

const API_URL = process.env.NEXT_PUBLIC_GAS_URL || "YOUR_GAS_URL";

export async function handleSubmit(data: SubmitData): Promise<APIResponse> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        essay: data.essay,
        rollNumber: data.rollNumber,
        focusLossCount: data.focusLossCount,
        category: data.category,
        topic: data.topic,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: APIResponse = await response.json();
    return result;
  } catch (error) {
    console.error("Submission failed:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Submission failed",
    };
  }
}
