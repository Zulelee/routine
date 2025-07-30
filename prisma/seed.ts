import { PrismaClient } from "@prisma/client";
import { addDays, format } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create sample user
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

  // Create sample tasks for the last few days
  const today = new Date();
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

  // Create tasks for today and yesterday
  for (let i = 0; i <= 1; i++) {
    const date = addDays(today, -i);
    const dateString = format(date, "yyyy-MM-dd");

    for (const taskData of sampleTasks) {
      await prisma.task.create({
        data: {
          ...taskData,
          user_id: user.id,
          date: date,
        },
      });
    }
  }

  console.log("✅ Created sample tasks");

  // Create sample daily logs
  const sampleLogs = [
    {
      journal_entry:
        "Had a productive day! Completed the presentation and went for a nice walk. Feeling accomplished and energized.",
      mood: "😊",
      water_glasses: 6,
      exercised: true,
      sleep_hours: 7.5,
      day_complete: true,
    },
    {
      journal_entry:
        "Started the day with some reading. Need to follow up on the project timeline. Overall feeling good about progress.",
      mood: "😐",
      water_glasses: 4,
      exercised: false,
      sleep_hours: 6.5,
      day_complete: false,
    },
  ];

  for (let i = 0; i <= 1; i++) {
    const date = addDays(today, -i);

    await prisma.dailyLog.create({
      data: {
        ...sampleLogs[i],
        user_id: user.id,
        date: date,
      },
    });
  }

  console.log("✅ Created sample daily logs");

  // Create a sample weekly review
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

  await prisma.weeklyReview.create({
    data: {
      user_id: user.id,
      week_start: weekStart,
      tasks_completed: 8,
      tasks_rolled_over: 2,
      average_water: 5.0,
      exercise_days: 3,
      notes:
        "Good progress this week! Need to focus more on exercise and water intake.",
    },
  });

  console.log("✅ Created sample weekly review");

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
