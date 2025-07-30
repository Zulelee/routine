import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";
import { CreateTaskData, UpdateTaskData } from "@/lib/types";

// GET /api/tasks - Get tasks for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser();
    const tasks = await prisma.task.findMany({
      where: {
        user_id: user.id,
        date: new Date(date),
      },
      orderBy: [
        { pinned: "desc" },
        { priority: "desc" },
        { created_at: "desc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskData = await request.json();
    const user = await getOrCreateUser();

    // Ensure date is properly converted to Date object
    const dateObj =
      typeof body.date === "string" ? new Date(body.date) : body.date;

    const task = await prisma.task.create({
      data: {
        ...body,
        user_id: user.id,
        date: dateObj,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
