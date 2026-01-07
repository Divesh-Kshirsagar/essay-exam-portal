"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";

export default function HomePage() {
  const router = useRouter();
  const { session } = useExam();

  useEffect(() => {
    if (!session.isLoggedIn) {
      router.push("/login");
    } else if (!session.topic) {
      router.push("/topic");
    } else if (!session.examStarted) {
      router.push("/topic");
    } else {
      router.push("/exam");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}
