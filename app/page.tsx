"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { TaskCard } from "@/components/task-card";
import { TaskForm } from "@/components/task-form";
import { HealthTracker } from "@/components/health-tracker";
import { JournalEntry } from "@/components/journal-entry";
import { EndDayModal } from "@/components/end-day-modal";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Target,
  CheckCircle,
  Clock,
  Pin,
  Calendar as CalendarIcon,
  Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isYesterday, addDays, subDays } from "date-fns";
import { TaskStatus, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: Priority;
  pinned: boolean;
  created_at: string;
}

interface DailyLog {
  id?: string;
  journal_entry?: string;
  mood?: string;
  water_glasses: number;
  exercised: boolean;
  sleep_hours?: number;
  day_complete?: boolean;
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    water_glasses: 0,
    exercised: false,
    sleep_hours: 0,
  });
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEndDayModalOpen, setIsEndDayModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { toast } = useToast();

  const selectedDateString = format(selectedDate, "yyyy-MM-dd");

  // Load tasks and daily log when selected date changes
  useEffect(() => {
    loadDayData();
  }, [selectedDate]);

  // Check if it's time to show end day modal (after 8 PM) only for today
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const isSelectedDateToday = isToday(selectedDate);

    // Show end day modal after 8 PM if not already shown today and we're viewing today
    if (hour >= 20 && !dailyLog.day_complete && isSelectedDateToday) {
      const shouldShowEndDay = window.confirm(
        "It's getting late! Would you like to end your day and reflect on your progress?"
      );
      if (shouldShowEndDay) {
        setIsEndDayModalOpen(true);
      }
    }
  }, [dailyLog.day_complete, selectedDate]);

  const LoadData = async () => {
    setIsLoading(true);
    try {
      const taskResponse = await fetch(`/api/tasks?date=${selectedDateString}`);
      if (taskResponse.ok) {
        const tasksData = await taskResponse.json();
        setTasks(tasksData);
      }

      const logResponse = await fetch(
        `/api/daily-logs?date=${selectedDateString}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadDayData = async () => {
    setIsLoading(true);
    try {
      // Load tasks for selected date
      const tasksResponse = await fetch(
        `/api/tasks?date=${selectedDateString}`
      );
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }

      // Load daily log for selected date
      const logResponse = await fetch(
        `/api/daily-logs?date=${selectedDateString}`
      );
      if (logResponse.ok) {
        const logData = await logResponse.json();
        if (logData) {
          setDailyLog(logData);
        } else {
          // Reset daily log for new date
          setDailyLog({
            water_glasses: 0,
            exercised: false,
            sleep_hours: 0,
          });
        }
      }
    } catch (error) {
      console.error("Error loading day's data:", error);
      toast({
        title: "Error",
        description: "Failed to load day's data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startNewDay = async () => {
    try {
      // Carry forward incomplete tasks from the previous day
      const response = await fetch("/api/tasks/carry-forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: format(subDays(selectedDate, 1), "yyyy-MM-dd"),
          toDate: selectedDateString,
        }),
      });

      if (response.ok) {
        const carriedTasks = await response.json();
        setTasks((prevTasks) => [...prevTasks, ...carriedTasks]);
        toast({
          title: "New day started",
          description: "Incomplete tasks have been carried forward.",
        });
      }
    } catch (error) {
      console.error("Error starting new day:", error);
      toast({
        title: "Error",
        description: "Failed to start new day.",
        variant: "destructive",
      });
    }
  };

  const initializeDatabase = async () => {
    try {
      const response = await fetch("/api/init", {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Database initialized",
          description: "Sample data has been created successfully.",
        });
        // Reload data after initialization
        loadDayData();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      toast({
        title: "Error",
        description: "Failed to initialize database.",
        variant: "destructive",
      });
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    priority?: Priority;
    status: TaskStatus;
  }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskData,
          date: selectedDateString,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        toast({
          title: "Task created",
          description: "Your task has been added successfully.",
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task.",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (taskData: {
    title: string;
    description?: string;
    priority?: Priority;
    status: TaskStatus;
  }) => {
    if (!editingTask) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) => (task.id === editingTask.id ? updatedTask : task))
        );
        setEditingTask(null);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks(tasks.filter((task) => task.id !== taskId));
        toast({
          title: "Task deleted",
          description: "Your task has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const updateTaskTitle = async (taskId: string, title: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
        toast({
          title: "Task updated",
          description: "Task title has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating task title:", error);
      toast({
        title: "Error",
        description: "Failed to update task title.",
        variant: "destructive",
      });
    }
  };

  const updateTaskDescription = async (taskId: string, description: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
        toast({
          title: "Task updated",
          description: "Task description has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error updating task description:", error);
      toast({
        title: "Error",
        description: "Failed to update task description.",
        variant: "destructive",
      });
    }
  };

  const toggleTaskPin = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !task.pinned }),
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
      }
    } catch (error) {
      console.error("Error toggling task pin:", error);
    }
  };

  const updateDailyLog = async (updates: Partial<DailyLog>) => {
    try {
      const response = await fetch("/api/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDateString,
          ...updates,
        }),
      });

      if (response.ok) {
        const updatedLog = await response.json();
        setDailyLog(updatedLog);
      }
    } catch (error) {
      console.error("Error updating daily log:", error);
    }
  };

  const handleTaskSubmit = (data: any) => {
    if (editingTask) {
      updateTask(data);
    } else {
      createTask(data);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setIsTaskFormOpen(true);
    }
  };

  const handleCloseTaskForm = () => {
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleEndDay = (data: {
    what_went_well: string;
    what_to_improve: string;
    notes_for_tomorrow: string;
  }) => {
    // Mark the day as complete
    updateDailyLog({ day_complete: true });

    // Here you could save the end-of-day reflection to the database
    console.log("End of day reflection:", data);
    toast({
      title: "Day ended successfully",
      description: "Your reflection has been saved. Great work today!",
    });
  };

  const handlePomodoroComplete = () => {
    toast({
      title: "Pomodoro session completed!",
      description: "Great focus! Time for a break.",
    });
  };

  const goToPreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const goToNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isSelectedDateToday = isToday(selectedDate);
  const isSelectedDateYesterday = isYesterday(selectedDate);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading day&apos;s data...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Today</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                    ←
                  </Button>
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                        {isSelectedDateToday && (
                          <Badge variant="secondary" className="ml-2">
                            Today
                          </Badge>
                        )}
                        {isSelectedDateYesterday && (
                          <Badge variant="secondary" className="ml-2">
                            Yesterday
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          if (date) {
                            setSelectedDate(date);
                            setIsDatePickerOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="sm" onClick={goToNextDay}>
                    →
                  </Button>
                </div>
                {!isSelectedDateToday && (
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEndDayModalOpen(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                End Day
              </Button>
              <Button onClick={() => setIsTaskFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>

          {/* Start New Day Button */}
          {!isSelectedDateToday && tasks.length === 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">No tasks for this day</h3>
                    <p className="text-sm text-muted-foreground">
                      Start working on this day by carrying forward incomplete
                      tasks from the previous day.
                    </p>
                  </div>
                  <Button onClick={startNewDay} className="gap-2">
                    <Play className="h-4 w-4" />
                    Start New Day
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {totalTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tasks
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {completedTasks}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dailyLog.water_glasses}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Water Glasses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dailyLog.exercised ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-muted-foreground">Exercised</div>
                </div>
              </div>
              {totalTasks > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <Badge variant="secondary">
                {completedTasks}/{totalTasks} completed
              </Badge>
            </div>

            {tasks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isSelectedDateToday
                      ? "Start your day by adding some tasks to accomplish."
                      : "No tasks for this day. Add some tasks or start a new day."}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setIsTaskFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Task
                    </Button>
                    {!isSelectedDateToday && (
                      <Button variant="outline" onClick={startNewDay}>
                        <Play className="h-4 w-4 mr-2" />
                        Start New Day
                      </Button>
                    )}
                    <Button variant="outline" onClick={initializeDatabase}>
                      Load Sample Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tasks.some((task) => task.pinned) && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Pin className="h-4 w-4" />
                      Pinned Tasks
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task) => task.pinned)
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            {...task}
                            onStatusChange={updateTaskStatus}
                            onPinToggle={toggleTaskPin}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                            onTitleChange={updateTaskTitle}
                            onDescriptionChange={updateTaskDescription}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {tasks.some((task) => !task.pinned) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Other Tasks
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter((task) => !task.pinned)
                        .map((task) => (
                          <TaskCard
                            key={task.id}
                            {...task}
                            onStatusChange={updateTaskStatus}
                            onPinToggle={toggleTaskPin}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                            onTitleChange={updateTaskTitle}
                            onDescriptionChange={updateTaskDescription}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PomodoroTimer onSessionComplete={handlePomodoroComplete} />

            <HealthTracker
              waterGlasses={dailyLog.water_glasses}
              exercised={dailyLog.exercised}
              sleepHours={dailyLog.sleep_hours || 0}
              onWaterChange={(glasses) =>
                updateDailyLog({ water_glasses: glasses })
              }
              onExerciseChange={(exercised) => updateDailyLog({ exercised })}
              onSleepChange={(hours) => updateDailyLog({ sleep_hours: hours })}
            />

            <JournalEntry
              journalEntry={dailyLog.journal_entry || ""}
              mood={dailyLog.mood || ""}
              onJournalChange={(entry) =>
                updateDailyLog({ journal_entry: entry })
              }
              onMoodChange={(mood) => updateDailyLog({ mood })}
              onSave={() => {
                toast({
                  title: "Journal saved",
                  description: "Your reflection has been saved successfully.",
                });
              }}
            />
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={handleTaskSubmit}
        initialData={editingTask || undefined}
        mode={editingTask ? "edit" : "create"}
      />

      {/* End Day Modal */}
      <EndDayModal
        isOpen={isEndDayModalOpen}
        onClose={() => setIsEndDayModalOpen(false)}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        waterGlasses={dailyLog.water_glasses}
        exercised={dailyLog.exercised}
        journalEntry={dailyLog.journal_entry}
        mood={dailyLog.mood}
        onSubmit={handleEndDay}
      />
    </div>
  );
}
