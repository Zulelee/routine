import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateClientData } from "@/lib/types";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        invoices: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateClientData = await request.json();

    // TODO: Get user_id from session/auth
    const user_id = "me"; // Replace with actual user ID

    const client = await prisma.client.create({
      data: {
        user_id,
        name: body.name,
        email: body.email,
        company: body.company,
        phone: body.phone,
        address: body.address,
        notes: body.notes,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
