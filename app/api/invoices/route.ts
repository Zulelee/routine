import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateInvoiceData } from "@/lib/types";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: {
          select: {
            name: true,
            company: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateInvoiceData = await request.json();

    // TODO: Get user_id from session/auth
    const user_id = "me"; // Replace with actual user ID

    const invoice = await prisma.invoice.create({
      data: {
        user_id,
        client_id: body.client_id,
        invoice_number: body.invoice_number,
        title: body.title,
        description: body.description,
        amount: body.amount,
        currency: body.currency || "USD",
        tax_rate: body.tax_rate || 0,
        issue_date: new Date(body.issue_date),
        due_date: new Date(body.due_date),
        notes: body.notes,
      },
      include: {
        client: {
          select: {
            name: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
