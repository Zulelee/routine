import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateTeamMemberData } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { user_id: "me" },
      include: {
        assignments: {
          where: { is_active: true },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Transform the data to match the expected format
    const transformedMembers = teamMembers.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      hourly_rate: member.hourly_rate,
      is_active: member.is_active,
      created_at: member.created_at,
      project_assignments: member.assignments.map((assignment) => ({
        id: assignment.id,
        project_id: assignment.project_id,
        project_name: assignment.project.name,
        client_name: assignment.project.client.name,
        hourly_rate: assignment.hourly_rate || 0,
        joined_date: assignment.joined_date,
        left_date: assignment.left_date,
        is_active: assignment.is_active,
      })),
    }));

    return NextResponse.json(transformedMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTeamMemberData = await request.json();

    const teamMember = await prisma.teamMember.create({
      data: {
        user_id: "me", // TODO: Get from auth
        name: body.name,
        email: body.email,
        role: body.role,
        hourly_rate: body.hourly_rate,
        notes: body.notes,
      },
      include: {
        assignments: {
          where: { is_active: true },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform the response
    const transformedMember = {
      id: teamMember.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      hourly_rate: teamMember.hourly_rate,
      is_active: teamMember.is_active,
      created_at: teamMember.created_at,
      project_assignments: teamMember.assignments.map((assignment) => ({
        id: assignment.id,
        project_id: assignment.project_id,
        project_name: assignment.project.name,
        client_name: assignment.project.client.name,
        hourly_rate: assignment.hourly_rate || 0,
        joined_date: assignment.joined_date,
        left_date: assignment.left_date,
        is_active: assignment.is_active,
      })),
    };

    return NextResponse.json(transformedMember, { status: 201 });
  } catch (error) {
    console.error("Error creating team member:", error);
    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}
