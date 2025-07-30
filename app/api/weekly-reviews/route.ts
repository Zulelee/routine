import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";
import { CreateWeeklyReviewData } from "@/lib/types";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";

// GET /api/weekly-reviews - Get weekly review for a specific week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("weekStart");

    if (!weekStart) {
      return NextResponse.json(
        { error: "Week start parameter is required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser();
    const weeklyReview = await prisma.weeklyReview.findUnique({
      where: {
        user_id_week_start: {
          user_id: user.id,
          week_start: new Date(weekStart),
        },
      },
    });

    return NextResponse.json(weeklyReview);
  } catch (error) {
    console.error("Error fetching weekly review:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly review" },
      { status: 500 }
    );
  }
}

// POST /api/weekly-reviews - Generate weekly review
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get("weekStart");
    const user = await getOrCreateUser();

    if (!weekStart) {
      return NextResponse.json(
        { error: "Week start parameter is required" },
        { status: 400 }
      );
    }

    const weekStartDate =
      typeof weekStart === "string" ? new Date(weekStart) : weekStart;
    const weekEndDate = endOfWeek(weekStartDate);
    const weekDays = eachDayOfInterval({
      start: weekStartDate,
      end: weekEndDate,
    });

    // Get all tasks for the week
    const weekTasks = await prisma.task.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
    });

    // Get all daily logs for the week
    const weekDailyLogs = await prisma.dailyLog.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
    });

    // Calculate statistics
    const tasksCompleted = weekTasks.filter(
      (task: any) => task.status === "done"
    ).length;
    const tasksRolledOver = weekTasks.filter(
      (task: any) =>
        task.status !== "done" &&
        format(task.date, "yyyy-MM-dd") === format(weekEndDate, "yyyy-MM-dd")
    ).length;

    const totalWater = weekDailyLogs.reduce(
      (sum: number, log: any) => sum + log.water_glasses,
      0
    );
    const averageWater =
      weekDailyLogs.length > 0 ? totalWater / weekDailyLogs.length : 0;

    const exerciseDays = weekDailyLogs.filter(
      (log: any) => log.exercised
    ).length;

    // Create or update weekly review
    const weeklyReview = await prisma.weeklyReview.upsert({
      where: {
        user_id_week_start: {
          user_id: user.id,
          week_start: weekStartDate,
        },
      },
      update: {
        tasks_completed: tasksCompleted,
        tasks_rolled_over: tasksRolledOver,
        average_water: averageWater,
        exercise_days: exerciseDays,
      },
      create: {
        user_id: user.id,
        week_start: weekStartDate,
        tasks_completed: tasksCompleted,
        tasks_rolled_over: tasksRolledOver,
        average_water: averageWater,
        exercise_days: exerciseDays,
      },
    });

    return NextResponse.json(weeklyReview, { status: 201 });
  } catch (error) {
    console.error("Error generating weekly review:", error);
    return NextResponse.json(
      { error: "Failed to generate weekly review" },
      { status: 500 }
    );
  }
}
