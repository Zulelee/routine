import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateInvoiceData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            name: true,
            company: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateInvoiceData = await request.json();

    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.tax_rate !== undefined) updateData.tax_rate = body.tax_rate;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.issue_date !== undefined)
      updateData.issue_date = new Date(body.issue_date);
    if (body.due_date !== undefined)
      updateData.due_date = new Date(body.due_date);
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Update sent_date when status changes to "sent"
    if (body.status === "sent") {
      updateData.sent_date = new Date();
    }

    // Update paid_date when status changes to "paid"
    if (body.status === "paid") {
      updateData.paid_date = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        client: {
          select: {
            name: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
