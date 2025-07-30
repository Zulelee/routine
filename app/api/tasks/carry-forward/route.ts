import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";
import { startOfDay } from "date-fns";

// POST /api/tasks/carry-forward - Carry forward incomplete tasks from one date to another
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromDate, toDate } = body;
    const user = await getOrCreateUser();

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { error: "fromDate and toDate parameters are required" },
        { status: 400 }
      );
    }

    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    // Get incomplete tasks from the fromDate
    const incompleteTasks = await prisma.task.findMany({
      where: {
        user_id: user.id,
        date: {
          gte: startOfDay(fromDateObj),
          lt: startOfDay(new Date(fromDateObj.getTime() + 24 * 60 * 60 * 1000)),
        },
        status: {
          in: ["todo", "in_progress"],
        },
      },
    });

    // Create new tasks for toDate with the same data
    const carriedForwardTasks = await Promise.all(
      incompleteTasks.map((task: any) =>
        prisma.task.create({
          data: {
            user_id: user.id,
            title: task.title,
            description: task.description,
            date: toDateObj,
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
