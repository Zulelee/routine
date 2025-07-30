import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";
import { addDays, startOfDay } from "date-fns";

// POST /api/tasks/carry-forward - Carry forward incomplete tasks from yesterday
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const today = searchParams.get("today");
    const user = await getOrCreateUser();

    if (!today) {
      return NextResponse.json(
        { error: "Today parameter is required" },
        { status: 400 }
      );
    }

    const todayDate = new Date(today);
    const yesterdayDate = addDays(todayDate, -1);

    // Get incomplete tasks from yesterday
    const incompleteTasks = await prisma.task.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: startOfDay(yesterdayDate),
          lt: startOfDay(addDays(yesterdayDate, 1)),
        },
        status: {
          in: ["todo", "in_progress"],
        },
      },
    });

    // Create new tasks for today with the same data
    const carriedForwardTasks = await Promise.all(
      incompleteTasks.map((task: any) =>
        prisma.task.create({
          data: {
            user_id: user.id,
            title: task.title,
            description: task.description,
            date: todayDate,
            status: "todo", // Reset status to todo
            pinned: task.pinned,
            priority: task.priority,
          },
        })
      )
    );

    return NextResponse.json({
      message: `Carried forward ${carriedForwardTasks.length} tasks`,
      tasks: carriedForwardTasks,
    });
  } catch (error) {
    console.error("Error carrying forward tasks:", error);
    return NextResponse.json(
      { error: "Failed to carry forward tasks" },
      { status: 500 }
    );
  }
}
