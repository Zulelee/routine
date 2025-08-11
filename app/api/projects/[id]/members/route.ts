import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateProjectMemberData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const members = await prisma.projectMember.findMany({
      where: { project_id: params.id },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Failed to fetch project members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: any = await request.json();

    const member = await prisma.projectMember.create({
      data: {
        project_id: params.id,
        team_member_id: body.team_member_id || null,
        name: body.name,
        role: body.role,
        email: body.email,
        hourly_rate: body.hourly_rate,
        payment_type: body.payment_type || "hourly_rate",
        payment_amount: body.payment_amount,
        notes: body.notes,
      },
      include: {
        teamMember: true,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating project member:", error);
    return NextResponse.json(
      { error: "Failed to create project member" },
      { status: 500 }
    );
  }
}
