import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateProjectData } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.client_id = clientId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        members: {
          where: { is_active: true },
          orderBy: { created_at: "desc" },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectData = await request.json();

    const project = await prisma.project.create({
      data: {
        user_id: "me", // TODO: Get from auth
        client_id: body.client_id,
        name: body.name,
        description: body.description,
        status: body.status || "planning",
        start_date: body.start_date ? new Date(body.start_date) : null,
        end_date: body.end_date ? new Date(body.end_date) : null,
        budget: body.budget,
        hourly_rate: body.hourly_rate,
        notes: body.notes,
        payment_type: body.payment_type || "hourly_rate",
        personal_project: body.personal_project || false,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
        members: {
          where: { is_active: true },
          orderBy: { created_at: "desc" },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
