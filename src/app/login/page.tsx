"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";
import { createStudentSession, hasAlreadySubmitted } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { config, login } = useExam();

  const [rollNumber, setRollNumber] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validate 8-digit roll number
  const isValidRollNumber = /^\d{8}$/.test(rollNumber);
  const showRollError = rollNumber.length > 0 && !isValidRollNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidRollNumber) {
      setError("Registration number must be exactly 8 digits");
      return;
    }

    if (!name.trim() || name.length < 3) {
      setError("Please enter your full name (at least 3 characters)");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    setIsLoading(true);

    try {
      // Check if already submitted
      const alreadySubmitted = await hasAlreadySubmitted(rollNumber);
      if (alreadySubmitted) {
        setError("This registration number has already submitted an exam.");
        setIsLoading(false);
        return;
      }

      // Create/update session in Firestore
      await createStudentSession(rollNumber, name, category);

      // Update local state
      login(rollNumber, name, category);
      router.push("/topic");
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <GraduationCap className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Exam Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your details to begin the examination
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Roll Number */}
            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="flex items-center justify-between">
                <span>Registration Number</span>
                {rollNumber.length > 0 && (
                  <Badge
                    variant="outline"
                    className={
                      isValidRollNumber
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border-red-500/30"
                    }
                  >
                    {rollNumber.length}/8 digits
                  </Badge>
                )}
              </Label>
              <Input
                id="rollNumber"
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={8}
                placeholder="Enter 8-digit registration number"
                value={rollNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                  setRollNumber(value);
                }}
                className={`text-lg font-mono tracking-wider ${
                  showRollError
                    ? "border-red-500/50 focus:border-red-500"
                    : isValidRollNumber
                      ? "border-emerald-500/50 focus:border-emerald-500"
                      : ""
                }`}
              />
              {showRollError && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Must be exactly 8 digits
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Section / Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="category"
                  className={category ? "border-emerald-500/50" : ""}
                >
                  <SelectValue placeholder="Select your section" />
                </SelectTrigger>
                <SelectContent>
                  {config.categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              disabled={!isValidRollNumber || !name.trim() || !category || isLoading}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Proceed to Exam
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/30">
            <h4 className="text-sm font-semibold mb-2 text-foreground/80">
              Before you begin:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Ensure stable internet connection</li>
              <li>• Exam duration: {config.examDurationMinutes} minutes</li>
              <li>• Tab switches will be monitored</li>
              <li>• Copy/paste is disabled during exam</li>
            </ul>
          </div>
  
        </CardContent>
      </Card>
    </div>
  );
}
