"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Timer, Play, Pause, RotateCcw, Coffee } from "lucide-react";

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerConfig {
  work: number; // 25 minutes in seconds
  shortBreak: number; // 5 minutes in seconds
  longBreak: number; // 15 minutes in seconds
}

const TIMER_CONFIG: TimerConfig = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIG.work);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>("work");
  const [completedSessions, setCompletedSessions] = useState(0);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getProgress = (): number => {
    const totalTime = TIMER_CONFIG[mode];
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeLabel = (): string => {
    switch (mode) {
      case "work":
        return "Focus Time";
      case "shortBreak":
        return "Short Break";
      case "longBreak":
        return "Long Break";
      default:
        return "Focus Time";
    }
  };

  const getModeIcon = () => {
    switch (mode) {
      case "work":
        return <Timer className="h-5 w-5 text-red-500" />;
      case "shortBreak":
      case "longBreak":
        return <Coffee className="h-5 w-5 text-green-500" />;
      default:
        return <Timer className="h-5 w-5 text-red-500" />;
    }
  };

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(TIMER_CONFIG[mode]);
  }, [mode]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_CONFIG[newMode]);
    setIsRunning(false);
  }, []);

  const completeSession = useCallback(() => {
    if (mode === "work") {
      setCompletedSessions((prev) => prev + 1);
      onSessionComplete?.();
    }

    // Auto-switch to next mode
    if (mode === "work") {
      // After 4 work sessions, take a long break
      const nextSession = completedSessions + 1;
      if (nextSession % 4 === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      // After break, go back to work
      switchMode("work");
    }
  }, [mode, completedSessions, onSessionComplete, switchMode]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished
            setIsRunning(false);
            completeSession();
            return TIMER_CONFIG[mode];
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, mode, completeSession]);

  // Reset timer when mode changes
  useEffect(() => {
    setTimeLeft(TIMER_CONFIG[mode]);
  }, [mode]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <CardTitle className="text-lg">{getModeLabel()}</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            Session {completedSessions + 1}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-primary mb-2">
            {formatTime(timeLeft)}
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {isRunning ? (
            <Button onClick={pauseTimer} variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button onClick={startTimer} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}
          <Button onClick={resetTimer} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-1">
          <Button
            variant={mode === "work" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("work")}
            className="flex-1"
          >
            Work
          </Button>
          <Button
            variant={mode === "shortBreak" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("shortBreak")}
            className="flex-1"
          >
            Short Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("longBreak")}
            className="flex-1"
          >
            Long Break
          </Button>
        </div>

        {/* Session Counter */}
        <div className="text-center text-sm text-muted-foreground">
          Completed sessions: {completedSessions}
        </div>
      </CardContent>
    </Card>
  );
}
