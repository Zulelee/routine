import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateProjectData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        members: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateProjectData = await request.json();

    const updateData: any = {};

    if (body.client_id !== undefined) updateData.client_id = body.client_id;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.start_date !== undefined)
      updateData.start_date = body.start_date
        ? new Date(body.start_date)
        : null;
    if (body.end_date !== undefined)
      updateData.end_date = body.end_date ? new Date(body.end_date) : null;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.hourly_rate !== undefined)
      updateData.hourly_rate = body.hourly_rate;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.payment_type !== undefined)
      updateData.payment_type = body.payment_type;

    const project = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
          },
        },
        members: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
