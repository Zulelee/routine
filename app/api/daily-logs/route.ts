import { NextRequest, NextResponse } from "next/server";
import { prisma, getOrCreateUser } from "@/lib/db";
import { CreateDailyLogData, UpdateDailyLogData } from "@/lib/types";

// GET /api/daily-logs - Get daily log for a specific date
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
    const dailyLog = await prisma.dailyLog.findUnique({
      where: {
        user_id_date: {
          user_id: user.id,
          date: new Date(date),
        },
      },
    });

    return NextResponse.json(dailyLog);
  } catch (error) {
    console.error("Error fetching daily log:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily log" },
      { status: 500 }
    );
  }
}

// POST /api/daily-logs - Create or update a daily log
export async function POST(request: NextRequest) {
  try {
    const body: CreateDailyLogData = await request.json();
    const user = await getOrCreateUser();

    // Remove date from update since it's part of the unique constraint
    const { date, ...updateData } = body;

    // Ensure date is properly converted to Date object
    const dateObj =
      typeof body.date === "string" ? new Date(body.date) : body.date;

    const dailyLog = await prisma.dailyLog.upsert({
      where: {
        user_id_date: {
          user_id: user.id,
          date: dateObj,
        },
      },
      update: updateData,
      create: {
        ...updateData,
        user_id: user.id,
        date: dateObj,
      },
    });

    return NextResponse.json(dailyLog, { status: 201 });
  } catch (error) {
    console.error("Error creating/updating daily log:", error);
    return NextResponse.json(
      { error: "Failed to create/update daily log" },
      { status: 500 }
    );
  }
}
