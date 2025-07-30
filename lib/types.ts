import { Task, DailyLog, WeeklyReview, User } from "@prisma/client";

export type TaskStatus = "todo" | "in_progress" | "done";
export type Priority = "low" | "medium" | "high";

export type TaskWithUser = Task & {
  user: User;
};

export type DailyLogWithUser = DailyLog & {
  user: User;
};

export type WeeklyReviewWithUser = WeeklyReview & {
  user: User;
};

export interface CreateTaskData {
  title: string;
  description?: string;
  date: Date | string;
  status?: TaskStatus;
  pinned?: boolean;
  priority?: Priority;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  pinned?: boolean;
  priority?: Priority;
}

export interface CreateDailyLogData {
  date: Date | string;
  journal_entry?: string;
  mood?: string;
  water_glasses?: number;
  exercised?: boolean;
  sleep_hours?: number;
  day_complete?: boolean;
}

export interface UpdateDailyLogData {
  journal_entry?: string;
  mood?: string;
  water_glasses?: number;
  exercised?: boolean;
  sleep_hours?: number;
  day_complete?: boolean;
}

export interface CreateWeeklyReviewData {
  week_start: Date | string;
  tasks_completed: number;
  tasks_rolled_over: number;
  average_water: number;
  exercise_days: number;
  notes?: string;
}

export interface EndDayData {
  what_went_well: string;
  what_to_improve: string;
  notes_for_tomorrow: string;
}
