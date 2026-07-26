import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    // We update the view count
    const property = await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
      select: { views: true }
    });
    
    return NextResponse.json({ success: true, views: property.views });
  } catch (error) {
    console.error("Error updating views:", error);
    return NextResponse.json({ error: "Failed to update views" }, { status: 500 });
  }
}
