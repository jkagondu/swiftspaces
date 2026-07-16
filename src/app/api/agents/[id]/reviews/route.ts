import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const agentId = id;
    const body = await request.json();
    const { customerName, rating, comment } = body;

    if (!customerName || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        customerName,
        rating: Number(rating),
        comment,
        agentId
      }
    });

    return NextResponse.json({ message: "Review added successfully", review }, { status: 201 });
  } catch (error) {
    console.error("Failed to add review:", error);
    return NextResponse.json({ error: "Failed to add review" }, { status: 500 });
  }
}
