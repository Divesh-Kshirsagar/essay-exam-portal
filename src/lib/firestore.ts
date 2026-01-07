import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  doc,
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
  name: string;
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
  name?: string;
  category: string;
  topic: string;
  essay: string;
  focusLossCount: number;
  wordCount?: number;
  charCount?: number;
}

export interface StudentSession {
  rollNumber: string;
  name?: string;
  category: string;
  topic: string;
  essay: string;
  focusLossCount: number;
  createdAt: Date;
  lastSavedAt: Date;
  isSubmitted: boolean;
  examStartedAt?: Date;
}

const SUBMISSIONS_COLLECTION = "submissions";
const SESSIONS_COLLECTION = "sessions";

/**
 * Create or update a student session on login
 */
export async function createStudentSession(
  rollNumber: string,
  name: string,
  category: string
): Promise<string> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, rollNumber);
  
  const existingSession = await getDoc(sessionRef);
  
  if (existingSession.exists()) {
    // Update existing session
    await updateDoc(sessionRef, {
      name,
      category,
      lastSavedAt: Timestamp.now(),
    });
  } else {
    // Create new session
    await setDoc(sessionRef, {
      rollNumber,
      name,
      category,
      topic: "",
      essay: "",
      focusLossCount: 0,
      createdAt: Timestamp.now(),
      lastSavedAt: Timestamp.now(),
      isSubmitted: false,
    });
  }
  
  return rollNumber;
}

/**
 * Update session with selected topic
 */
export async function updateSessionTopic(
  rollNumber: string,
  topic: string
): Promise<void> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, rollNumber);
  await updateDoc(sessionRef, {
    topic,
    examStartedAt: Timestamp.now(),
    lastSavedAt: Timestamp.now(),
  });
}

/**
 * Save essay progress (called every 30 seconds with dirty check)
 */
export async function saveEssayProgress(
  rollNumber: string,
  essay: string,
  focusLossCount: number
): Promise<void> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, rollNumber);
  await updateDoc(sessionRef, {
    essay,
    focusLossCount,
    lastSavedAt: Timestamp.now(),
  });
}

/**
 * Get student session
 */
export async function getStudentSession(
  rollNumber: string
): Promise<StudentSession | null> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, rollNumber);
  const snapshot = await getDoc(sessionRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.data();
  return {
    rollNumber: data.rollNumber,
    name: data.name || "",
    category: data.category,
    topic: data.topic || "",
    essay: data.essay || "",
    focusLossCount: data.focusLossCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    lastSavedAt: data.lastSavedAt?.toDate() || new Date(),
    isSubmitted: data.isSubmitted || false,
    examStartedAt: data.examStartedAt?.toDate(),
  };
}

/**
 * Mark session as submitted
 */
export async function markSessionSubmitted(rollNumber: string): Promise<void> {
  const sessionRef = doc(db, SESSIONS_COLLECTION, rollNumber);
  await updateDoc(sessionRef, {
    isSubmitted: true,
    lastSavedAt: Timestamp.now(),
  });
}

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
    name: input.name || "",
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

  // Mark session as submitted
  await markSessionSubmitted(input.rollNumber);

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
      name: data.name || "",
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
 * Fetch all sessions (for admin view)
 */
export async function getAllSessions(): Promise<StudentSession[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    orderBy("lastSavedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      rollNumber: data.rollNumber,
      name: data.name || "",
      category: data.category,
      topic: data.topic || "",
      essay: data.essay || "",
      focusLossCount: data.focusLossCount || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastSavedAt: data.lastSavedAt?.toDate() || new Date(),
      isSubmitted: data.isSubmitted || false,
      examStartedAt: data.examStartedAt?.toDate(),
    };
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
