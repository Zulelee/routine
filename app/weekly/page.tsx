"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Target,
  Droplets,
  Dumbbell,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface WeeklyStats {
  tasksCompleted: number;
  tasksRolledOver: number;
  averageWater: number;
  exerciseDays: number;
  journalDays: number;
  totalTasks: number;
}

export default function WeeklyPage() {
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    tasksCompleted: 0,
    tasksRolledOver: 0,
    averageWater: 0,
    exerciseDays: 0,
    journalDays: 0,
    totalTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWeeklyStats();
  }, []);

  const loadWeeklyStats = async () => {
    setIsLoading(true);
    try {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

      let totalCompleted = 0;
      let totalRolledOver = 0;
      let totalWater = 0;
      let exerciseDays = 0;
      let journalDays = 0;
      let totalTasks = 0;

      for (const day of days) {
        const dayString = format(day, "yyyy-MM-dd");

        // Fetch tasks for this day
        const tasksResponse = await fetch(`/api/tasks?date=${dayString}`);
        const tasks = tasksResponse.ok ? await tasksResponse.json() : [];

        // Fetch daily log for this day
        const logResponse = await fetch(`/api/daily-logs?date=${dayString}`);
        const log = logResponse.ok ? await logResponse.json() : null;

        const completed = tasks.filter(
          (task: any) => task.status === "done"
        ).length;
        const rolledOver = tasks.filter(
          (task: any) =>
            task.status !== "done" &&
            format(new Date(task.date), "yyyy-MM-dd") ===
              format(weekEnd, "yyyy-MM-dd")
        ).length;

        totalCompleted += completed;
        totalRolledOver += rolledOver;
        totalTasks += tasks.length;

        if (log) {
          totalWater += log.water_glasses || 0;
          if (log.exercised) exerciseDays++;
          if (log.journal_entry && log.journal_entry.length > 0) journalDays++;
        }
      }

      setWeeklyStats({
        tasksCompleted: totalCompleted,
        tasksRolledOver: totalRolledOver,
        averageWater: totalWater / 7,
        exerciseDays,
        journalDays,
        totalTasks,
      });
    } catch (error) {
      console.error("Error loading weekly stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateWeeklyReview = async () => {
    try {
      const weekStart = startOfWeek(new Date());
      const response = await fetch(
        `/api/weekly-reviews?weekStart=${format(weekStart, "yyyy-MM-dd")}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        // Reload stats after generating review
        await loadWeeklyStats();
      }
    } catch (error) {
      console.error("Error generating weekly review:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading weekly data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const completionRate =
    weeklyStats.totalTasks > 0
      ? Math.round((weeklyStats.tasksCompleted / weeklyStats.totalTasks) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Weekly Review</h1>
              <p className="text-muted-foreground">
                {format(startOfWeek(new Date()), "MMM d")} -{" "}
                {format(endOfWeek(new Date()), "MMM d, yyyy")}
              </p>
            </div>
            <Button onClick={generateWeeklyReview}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Review
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Task Completion */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasks Completed
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyStats.tasksCompleted}
              </div>
              <p className="text-xs text-muted-foreground">
                {completionRate}% completion rate
              </p>
              <Progress value={completionRate} className="mt-2" />
            </CardContent>
          </Card>

          {/* Water Intake */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Water Intake
              </CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyStats.averageWater.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">glasses per day</p>
            </CardContent>
          </Card>

          {/* Exercise */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Exercise Days
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyStats.exerciseDays}
              </div>
              <p className="text-xs text-muted-foreground">out of 7 days</p>
            </CardContent>
          </Card>

          {/* Journal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Journal Entries
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {weeklyStats.journalDays}
              </div>
              <p className="text-xs text-muted-foreground">days with entries</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Tasks</span>
                  <Badge variant="secondary">{weeklyStats.totalTasks}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <Badge variant="default">{weeklyStats.tasksCompleted}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Rolled Over</span>
                  <Badge variant="outline">{weeklyStats.tasksRolledOver}</Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Health & Wellness</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exercise Streak</span>
                    <span>{weeklyStats.exerciseDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Water Goal</span>
                    <span>
                      {weeklyStats.averageWater.toFixed(1)} avg glasses
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Journaling</span>
                    <span>{weeklyStats.journalDays} entries</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {completionRate >= 80 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎉 Great job! You completed {completionRate}% of your
                      tasks this week.
                    </p>
                  </div>
                )}

                {weeklyStats.exerciseDays >= 5 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💪 Excellent! You exercised {weeklyStats.exerciseDays}{" "}
                      days this week.
                    </p>
                  </div>
                )}

                {weeklyStats.averageWater >= 6 && (
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <p className="text-sm text-cyan-800">
                      💧 Well hydrated! You averaged{" "}
                      {weeklyStats.averageWater.toFixed(1)} glasses of water
                      daily.
                    </p>
                  </div>
                )}

                {weeklyStats.journalDays >= 5 && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      📝 Consistent journaling! You wrote{" "}
                      {weeklyStats.journalDays} entries this week.
                    </p>
                  </div>
                )}

                {weeklyStats.tasksRolledOver > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ You have {weeklyStats.tasksRolledOver} tasks carried
                      over to next week.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
