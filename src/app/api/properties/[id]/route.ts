import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: { agencyName: true, phoneNumber: true, email: true }
        }
      }
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Failed to fetch property:", error);
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // We update the fields
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title: body.title,
        location: body.location,
        price: body.price,
        type: body.type,
        status: body.status,
        description: body.description,
        beds: parseInt(body.beds) || 0,
        baths: parseInt(body.baths) || 0,
        images: body.images
      }
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error("Failed to update property:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}
