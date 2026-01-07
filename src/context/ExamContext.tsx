"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Types
export interface ExamConfig {
  categories: string[];
  topics: Record<string, string[]>;
  examDurationMinutes: number;
  minCharCount: number;
  maxCharCount: number;
}

export interface StudentSession {
  rollNumber: string;
  category: string;
  topic: string;
  isLoggedIn: boolean;
  examStarted: boolean;
  examStartTime: number | null;
}

interface ExamContextType {
  config: ExamConfig;
  session: StudentSession;
  login: (rollNumber: string, category: string) => void;
  selectTopic: (topic: string) => void;
  startExam: () => void;
  logout: () => void;
  updateConfig: (newConfig: Partial<ExamConfig>) => void;
}

// Default configuration
const defaultConfig: ExamConfig = {
  categories: ["Section A", "Section B", "Section C", "AIML"],
  topics: {
    "Section A": [
      "The Impact of Technology on Education",
      "Climate Change and Its Effects",
      "The Future of Remote Work",
    ],
    "Section B": [
      "Social Media and Mental Health",
      "The Role of AI in Healthcare",
      "Sustainable Development Goals",
    ],
    "Section C": [
      "Digital Privacy in the Modern Age",
      "The Gig Economy",
      "Renewable Energy Sources",
    ],
    "AIML": [
      "Ethics in Artificial Intelligence",
      "Machine Learning in Everyday Life",
      "The Future of Autonomous Vehicles",
    ],
  },
  examDurationMinutes: parseInt(process.env.NEXT_PUBLIC_EXAM_DURATION || "60", 10),
  minCharCount: 1000,
  maxCharCount: 5000,
};

const defaultSession: StudentSession = {
  rollNumber: "",
  category: "",
  topic: "",
  isLoggedIn: false,
  examStarted: false,
  examStartTime: null,
};

// Context
const ExamContext = createContext<ExamContextType | null>(null);

// Provider
export function ExamProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ExamConfig>(defaultConfig);
  const [session, setSession] = useState<StudentSession>(defaultSession);

  const login = useCallback((rollNumber: string, category: string) => {
    setSession((prev) => ({
      ...prev,
      rollNumber,
      category,
      isLoggedIn: true,
    }));
  }, []);

  const selectTopic = useCallback((topic: string) => {
    setSession((prev) => ({
      ...prev,
      topic,
    }));
  }, []);

  const startExam = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      examStarted: true,
      examStartTime: Date.now(),
    }));
  }, []);

  const logout = useCallback(() => {
    setSession(defaultSession);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ExamConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  return (
    <ExamContext.Provider
      value={{
        config,
        session,
        login,
        selectTopic,
        startExam,
        logout,
        updateConfig,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}

// Hook
export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
}
