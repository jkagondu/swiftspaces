import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: {
          select: { id: true, agencyName: true, phoneNumber: true, email: true, isVerified: true }
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
        images: body.images,
        categorizedImages: body.categorizedImages !== undefined ? body.categorizedImages : undefined,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl : undefined,
        virtualTourUrl: body.virtualTourUrl !== undefined ? body.virtualTourUrl : undefined,
        tiktokUrl: body.tiktokUrl !== undefined ? body.tiktokUrl : undefined,
        transitScore: body.transitScore !== undefined ? body.transitScore : undefined,
        walkability: body.walkability !== undefined ? body.walkability : undefined,
        nearbyPlaces: body.nearbyPlaces !== undefined ? body.nearbyPlaces : undefined,
        nearbySchools: body.nearbySchools !== undefined ? body.nearbySchools : undefined,
        nearbyHospitals: body.nearbyHospitals !== undefined ? body.nearbyHospitals : undefined,
        deposit: body.deposit !== undefined ? body.deposit : undefined,
        waterBill: body.waterBill !== undefined ? body.waterBill : undefined,
        electricity: body.electricity !== undefined ? body.electricity : undefined,
        parking: body.parking !== undefined ? body.parking : undefined,
        petFriendly: body.petFriendly !== undefined ? Boolean(body.petFriendly) : undefined,
      }
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error("Failed to update property:", error);
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.property.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Failed to delete property:", error);
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 });
  }
}

