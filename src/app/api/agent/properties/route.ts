import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentId = (session.user as any).id;

    const properties = await prisma.property.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Failed to fetch agent properties:", error);
    return NextResponse.json({ error: "Failed to fetch agent properties" }, { status: 500 });
  }
}
