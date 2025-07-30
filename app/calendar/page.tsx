"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, BookOpen, Droplets } from "lucide-react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

interface DayData {
  date: Date;
  hasTasks: boolean;
  hasJournal: boolean;
  hasHealth: boolean;
  completedTasks: number;
  totalTasks: number;
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [monthData, setMonthData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (date) {
      loadMonthData(date);
    }
  }, [date]);

  const loadMonthData = async (selectedDate: Date) => {
    setIsLoading(true);
    try {
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);
      const days = eachDayOfInterval({ start: startDate, end: endDate });

      const monthData: DayData[] = await Promise.all(
        days.map(async (day) => {
          const dayString = format(day, "yyyy-MM-dd");

          // Fetch tasks for this day
          const tasksResponse = await fetch(`/api/tasks?date=${dayString}`);
          const tasks = tasksResponse.ok ? await tasksResponse.json() : [];

          // Fetch daily log for this day
          const logResponse = await fetch(`/api/daily-logs?date=${dayString}`);
          const log = logResponse.ok ? await logResponse.json() : null;

          return {
            date: day,
            hasTasks: tasks.length > 0,
            hasJournal: log?.journal_entry
              ? log.journal_entry.length > 0
              : false,
            hasHealth: log
              ? log.water_glasses > 0 || log.exercised || log.sleep_hours > 0
              : false,
            completedTasks: tasks.filter((task: any) => task.status === "done")
              .length,
            totalTasks: tasks.length,
          };
        })
      );

      setMonthData(monthData);
    } catch (error) {
      console.error("Error loading month data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayContent = (day: Date) => {
    const dayData = monthData.find((d) => isSameDay(d.date, day));
    if (!dayData) return null;

    const dots = [];
    if (dayData.hasTasks) {
      dots.push(
        <div
          key="tasks"
          className="w-2 h-2 bg-blue-500 rounded-full"
          title="Tasks"
        />
      );
    }
    if (dayData.hasJournal) {
      dots.push(
        <div
          key="journal"
          className="w-2 h-2 bg-purple-500 rounded-full"
          title="Journal"
        />
      );
    }
    if (dayData.hasHealth) {
      dots.push(
        <div
          key="health"
          className="w-2 h-2 bg-green-500 rounded-full"
          title="Health"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-sm">{format(day, "d")}</span>
        {dots.length > 0 && <div className="flex gap-1 mt-1">{dots}</div>}
        {dayData.totalTasks > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            {dayData.completedTasks}/{dayData.totalTasks}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">
            View your daily activities and progress over time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading calendar data...
                      </p>
                    </div>
                  </div>
                ) : (
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Legend and Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Journal Entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Health Tracking</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Days with Tasks</span>
                  <Badge variant="secondary">
                    {monthData.filter((d) => d.hasTasks).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Days with Journal</span>
                  <Badge variant="secondary">
                    {monthData.filter((d) => d.hasJournal).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Days with Health Data</span>
                  <Badge variant="secondary">
                    {monthData.filter((d) => d.hasHealth).length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Tasks Completed</span>
                  <Badge variant="secondary">
                    {monthData.reduce((sum, d) => sum + d.completedTasks, 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  View Today
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add Journal Entry
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Droplets className="h-4 w-4 mr-2" />
                  Track Health
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
