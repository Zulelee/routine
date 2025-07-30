import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addDays, format } from "date-fns";

export async function POST(request: NextRequest) {
  try {
    // Create the user
    const user = await prisma.user.upsert({
      where: { email: "me@example.com" },
      update: {},
      create: {
        id: "me",
        email: "me@example.com",
        name: "Me",
      },
    });

    console.log("✅ Created user:", user.email);

    // Create sample tasks for today
    const today = new Date();
    const todayString = format(today, "yyyy-MM-dd");

    const sampleTasks = [
      {
        title: "Complete project presentation",
        description: "Finish the slides for the quarterly review meeting",
        priority: "high" as const,
        status: "done" as const,
        pinned: true,
      },
      {
        title: "Go for a 30-minute walk",
        description: "Get some fresh air and exercise",
        priority: "medium" as const,
        status: "done" as const,
        pinned: false,
      },
      {
        title: "Read 20 pages of book",
        description: 'Continue reading "Atomic Habits"',
        priority: "low" as const,
        status: "todo" as const,
        pinned: false,
      },
      {
        title: "Call mom",
        description: "Check in and catch up",
        priority: "medium" as const,
        status: "todo" as const,
        pinned: true,
      },
      {
        title: "Organize desk",
        description: "Clean up workspace and file documents",
        priority: "low" as const,
        status: "in_progress" as const,
        pinned: false,
      },
    ];

    // Create tasks for today
    for (const taskData of sampleTasks) {
      await prisma.task.create({
        data: {
          ...taskData,
          user_id: user.id,
          date: today,
        },
      });
    }

    // Create sample daily log for today
    await prisma.dailyLog.create({
      data: {
        user_id: user.id,
        date: today,
        journal_entry:
          "Had a productive day! Completed the presentation and went for a nice walk. Feeling accomplished and energized.",
        mood: "😊",
        water_glasses: 6,
        exercised: true,
        sleep_hours: 7.5,
        day_complete: false,
      },
    });

    console.log("✅ Created sample data");

    return NextResponse.json({
      message: "Database initialized successfully",
      user: user.email,
      tasksCreated: sampleTasks.length,
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
