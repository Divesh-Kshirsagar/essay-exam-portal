import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface Submission {
  id?: string;
  rollNumber: string;
  category: string;
  topic: string;
  essay: string;
  wordCount: number;
  focusLossCount: number;
  score: number;
  feedback: string;
  checkpoints: Record<string, unknown>;
  submittedAt: Date;
}

export interface SubmissionInput {
  rollNumber: string;
  category: string;
  topic: string;
  essay: string;
  focusLossCount: number;
}

const SUBMISSIONS_COLLECTION = "submissions";

/**
 * Save a graded submission to Firestore
 */
export async function saveSubmission(
  input: SubmissionInput,
  gradeResult: { score: number; feedback: string; checkpoints: Record<string, unknown> }
): Promise<string> {
  const wordCount = input.essay.trim() ? input.essay.trim().split(/\s+/).length : 0;

  const submission: Omit<Submission, "id"> = {
    rollNumber: input.rollNumber,
    category: input.category,
    topic: input.topic,
    essay: input.essay,
    wordCount,
    focusLossCount: input.focusLossCount,
    score: gradeResult.score,
    feedback: gradeResult.feedback,
    checkpoints: gradeResult.checkpoints,
    submittedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
    ...submission,
    submittedAt: Timestamp.fromDate(submission.submittedAt),
  });

  return docRef.id;
}

/**
 * Fetch all submissions from Firestore
 */
export async function getAllSubmissions(): Promise<Submission[]> {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    orderBy("submittedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      rollNumber: data.rollNumber,
      category: data.category,
      topic: data.topic,
      essay: data.essay,
      wordCount: data.wordCount,
      focusLossCount: data.focusLossCount,
      score: data.score,
      feedback: data.feedback,
      checkpoints: data.checkpoints || {},
      submittedAt: data.submittedAt?.toDate() || new Date(),
    } as Submission;
  });
}

/**
 * Check if a roll number has already submitted
 */
export async function hasAlreadySubmitted(rollNumber: string): Promise<boolean> {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where("rollNumber", "==", rollNumber)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Get submissions by category
 */
export async function getSubmissionsByCategory(category: string): Promise<Submission[]> {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where("category", "==", category),
    orderBy("submittedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      submittedAt: data.submittedAt?.toDate() || new Date(),
    } as Submission;
  });
}
