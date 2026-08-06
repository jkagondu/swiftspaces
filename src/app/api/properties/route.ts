import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Removed prisma enums to fix vercel build

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
      query.type = typeParam as any;
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
    const { 
      title, description, location, price, type, status, beds, baths, agentId, images, 
      latitude: providedLat, longitude: providedLng, 
      videoUrl, virtualTourUrl, transitScore, walkability, nearbyPlaces,
      nearbySchools, nearbyHospitals, deposit, waterBill, electricity, parking, petFriendly
    } = body;

    // Validation
    if (!title || !location || !price || !agentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Geocoding: Convert location string to lat/lng
    let latitude = (providedLat && providedLat.toString().trim() !== "") ? parseFloat(providedLat) : null;
    let longitude = (providedLng && providedLng.toString().trim() !== "") ? parseFloat(providedLng) : null;
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    // Only use Mapbox geocoding if explicit coordinates are not provided
    if (location && mapboxToken && (!latitude || !longitude)) {
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
        type: type as any,
        status: status as any,
        beds: parseInt(beds) || 0,
        baths: parseInt(baths) || 0,
        latitude,
        longitude,
        agentId,
        images: images || [],
        videoUrl: videoUrl || null,
        virtualTourUrl: virtualTourUrl || null,
        transitScore: transitScore || null,
        walkability: walkability || null,
        nearbyPlaces: nearbyPlaces || null,
        nearbySchools: nearbySchools || null,
        nearbyHospitals: nearbyHospitals || null,
        deposit: deposit || null,
        waterBill: waterBill || null,
        electricity: electricity || null,
        parking: parking || null,
        petFriendly: Boolean(petFriendly),
      }
    });

    // Check for matching Alert Subscriptions
    try {
      const subscriptions = await prisma.alertSubscription.findMany();
      // This is a naive matching implementation for demonstration
      // In production, you would parse the JSON query and accurately check price/location limits
      const matchingEmails = subscriptions
        .filter(sub => {
          try {
            const query = JSON.parse(sub.query);
            if (query.location && !property.location.toLowerCase().includes(query.location.toLowerCase())) return false;
            if (query.type && query.type !== 'all' && property.type.toLowerCase() !== query.type.toLowerCase()) return false;
            // Matches!
            return true;
          } catch (e) { return false; }
        })
        .map(sub => sub.email);

      if (matchingEmails.length > 0 && process.env.RESEND_API_KEY) {
        // Send email to matching users
        const { Resend } = require('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await Promise.all(matchingEmails.map(email => 
          resend.emails.send({
            from: "SwiftSpace Alerts <onboarding@resend.dev>",
            to: email,
            subject: `New Property Match: ${property.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0f172a; padding: 20px; text-align: center; color: white;">
                  <h1 style="margin: 0; font-size: 24px;">New Property Alert</h1>
                </div>
                <div style="padding: 20px;">
                  <p>A new property just hit the market that matches your search criteria!</p>
                  <h2>${property.title}</h2>
                  <p><strong>Location:</strong> ${property.location}</p>
                  <p><strong>Price:</strong> ${property.price}</p>
                  <p><strong>Type:</strong> ${property.type.replace('_', ' ')}</p>
                  <a href="https://swiftspace-tau.vercel.app/properties/${property.id}" style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Property</a>
                </div>
              </div>
            `
          })
        ));
      }
    } catch (alertError) {
      console.error("Failed to process alerts:", alertError);
      // Don't fail the property creation if alerts fail
    }

    return NextResponse.json({ message: "Property created successfully", property }, { status: 201 });
  } catch (error) {
    console.error("Failed to create property:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
