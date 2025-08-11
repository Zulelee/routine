import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateInvoiceData } from "@/lib/types";

// Function to generate next invoice number
async function generateNextInvoiceNumber(userId: string): Promise<string> {
  try {
    // Get the latest invoice for this user
    const latestInvoice = await prisma.invoice.findFirst({
      where: { user_id: userId },
      orderBy: { invoice_number: "desc" },
    });

    if (!latestInvoice) {
      // First invoice
      return "INV-001";
    }

    // Extract the number from the latest invoice
    const match = latestInvoice.invoice_number.match(/INV-(\d+)/);
    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      return `INV-${nextNumber.toString().padStart(3, "0")}`;
    }

    // If the format doesn't match, try to extract any number
    const numberMatch = latestInvoice.invoice_number.match(/(\d+)/);
    if (numberMatch) {
      const nextNumber = parseInt(numberMatch[1]) + 1;
      return `INV-${nextNumber.toString().padStart(3, "0")}`;
    }

    // Fallback: use timestamp
    const timestamp = Date.now();
    return `INV-${timestamp}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    // Ultimate fallback
    return `INV-${Date.now()}`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nextNumber = searchParams.get("nextNumber");

    // If requesting next invoice number
    if (nextNumber === "true") {
      const user_id = "me"; // TODO: Get from session/auth
      const nextInvoiceNumber = await generateNextInvoiceNumber(user_id);
      return NextResponse.json({ nextInvoiceNumber });
    }

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

    // Generate invoice number if not provided
    const invoice_number =
      body.invoice_number || (await generateNextInvoiceNumber(user_id));

    const invoice = await prisma.invoice.create({
      data: {
        user_id,
        client_id: body.client_id,
        invoice_number,
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
