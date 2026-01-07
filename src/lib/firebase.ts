import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent duplicate initialization in development)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore
export const db = getFirestore(app);

/**
 * Ping the database to check connectivity
 * Returns { success: true, latencyMs } on success, or { success: false, error } on failure
 */
export async function pingDatabase(): Promise<{
  success: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Try to read/write a test document in a _ping collection
    const pingRef = doc(db, "_ping", "connectivity-test");
    
    // Write a timestamp
    await setDoc(pingRef, {
      timestamp: Timestamp.now(),
      clientTime: new Date().toISOString(),
    });
    
    // Read it back to verify
    const snapshot = await getDoc(pingRef);
    
    if (!snapshot.exists()) {
      return {
        success: false,
        error: "Failed to verify written document",
      };
    }
    
    const latencyMs = Date.now() - startTime;
    
    return {
      success: true,
      latencyMs,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default app;
