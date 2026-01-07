"use client";

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_ADMIN_PASSWORD: process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? "****SET****" : "NOT SET",
    NEXT_PUBLIC_EXAM_DURATION: process.env.NEXT_PUBLIC_EXAM_DURATION,
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl mb-6 text-green-400">🔍 Environment Variables Debug</h1>
      <div className="space-y-2">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex gap-4">
            <span className="text-yellow-400 w-96">{key}:</span>
            <span className={value ? "text-green-400" : "text-red-400"}>
              {value || "undefined"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-gray-900 rounded">
        <p className="text-gray-400">
          If all values show as undefined, the .env.local file is not being read correctly.
        </p>
        <p className="text-gray-400 mt-2">
          Try: 1) Check file encoding (should be UTF-8), 2) Restart dev server, 3) Delete .next folder
        </p>
      </div>
    </div>
  );
}
