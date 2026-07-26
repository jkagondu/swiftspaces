import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, query } = await request.json();

    if (!email || !query) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subscription = await prisma.alertSubscription.create({
      data: {
        email,
        query: JSON.stringify(query), // Store search params as JSON
      }
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error creating alert subscription:", error);
    return NextResponse.json({ error: "Failed to save search" }, { status: 500 });
  }
}
