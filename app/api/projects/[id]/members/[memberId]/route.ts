import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateProjectMemberData } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const body: UpdateProjectMemberData = await request.json();

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.hourly_rate !== undefined)
      updateData.hourly_rate = body.hourly_rate;
    if (body.payment_type !== undefined)
      updateData.payment_type = body.payment_type;
    if (body.payment_amount !== undefined)
      updateData.payment_amount = body.payment_amount;
    if (body.payment_status !== undefined)
      updateData.payment_status = body.payment_status;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.left_date !== undefined)
      updateData.left_date = body.left_date ? new Date(body.left_date) : null;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const member = await prisma.projectMember.update({
      where: { id: params.memberId },
      data: updateData,
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error updating project member:", error);
    return NextResponse.json(
      { error: "Failed to update project member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    await prisma.projectMember.delete({
      where: { id: params.memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project member:", error);
    return NextResponse.json(
      { error: "Failed to delete project member" },
      { status: 500 }
    );
  }
}
