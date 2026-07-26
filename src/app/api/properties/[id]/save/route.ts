import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const action = body.action; // "save" or "unsave"
    
    const incrementValue = action === "unsave" ? -1 : 1;
    
    // We update the save count, making sure it doesn't go below 0
    let property = await prisma.property.findUnique({ where: { id }, select: { saves: true } });
    
    if (property) {
      const newSaves = Math.max(0, property.saves + incrementValue);
      property = await prisma.property.update({
        where: { id },
        data: { saves: newSaves },
        select: { saves: true }
      });
    }
    
    return NextResponse.json({ success: true, saves: property?.saves || 0 });
  } catch (error) {
    console.error("Error updating saves:", error);
    return NextResponse.json({ error: "Failed to update saves" }, { status: 500 });
  }
}
