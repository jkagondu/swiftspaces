import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, isFeatured } = await request.json();

    if (!propertyId || typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: { isFeatured }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update feature status:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
