import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PropertyStatus } from '@prisma/client';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, status } = body; 

    if (!propertyId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify property belongs to agent
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.agentId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized to update this property" }, { status: 403 });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: { status: status as PropertyStatus }
    });

    return NextResponse.json({ message: "Property status updated", property: updatedProperty }, { status: 200 });
  } catch (error) {
    console.error("Failed to update property status:", error);
    return NextResponse.json({ error: "Failed to update property status" }, { status: 500 });
  }
}
