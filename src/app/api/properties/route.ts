import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PropertyType, PropertyStatus } from '@prisma/client';

// GET: Fetch all properties (with optional filtering)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const typeParam = searchParams.get('type');

    // Build the query dynamically
    const query: any = {};
    if (location) {
      query.location = { contains: location, mode: 'insensitive' };
    }
    if (typeParam && typeParam !== 'all') {
      query.type = typeParam as PropertyType;
    }

    const properties = await prisma.property.findMany({
      where: query,
      include: {
        agent: {
          select: { agencyName: true, phoneNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

// POST: Create a new property
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, location, price, type, status, beds, baths, agentId, images } = body;

    // Validation
    if (!title || !location || !price || !agentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Geocoding: Convert location string to lat/lng
    let latitude = null;
    let longitude = null;
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (location && mapboxToken) {
      try {
        const geoRes = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${mapboxToken}&limit=1`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.features && geoData.features.length > 0) {
            longitude = geoData.features[0].center[0];
            latitude = geoData.features[0].center[1];
          }
        }
      } catch (err) {
        console.error("Geocoding failed for:", location, err);
      }
    }

    const property = await prisma.property.create({
      data: {
        title,
        description: description || "",
        location,
        price,
        type: type as PropertyType,
        status: status as PropertyStatus,
        beds: parseInt(beds) || 0,
        baths: parseInt(baths) || 0,
        latitude,
        longitude,
        agentId,
        images: images || []
      }
    });

    return NextResponse.json({ message: "Property created successfully", property }, { status: 201 });
  } catch (error) {
    console.error("Failed to create property:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
