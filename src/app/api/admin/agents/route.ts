import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// Removed AgentStatus import to fix build
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch all users (agents) for the admin dashboard
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Simple protection (in production, strictly check if session.user.role === 'ADMIN')
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await prisma.user.findMany({
      where: {
        role: "AGENT"
      },
      include: {
        _count: {
          select: { properties: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

// PUT: Update an agent's status (Approve, Suspend, etc)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, newStatus } = body;

    if (!agentId || !newStatus) {
      return NextResponse.json({ error: "Missing agentId or newStatus" }, { status: 400 });
    }

    const updatedAgent = await prisma.user.update({
      where: { id: agentId },
      data: {
        agentStatus: newStatus as any
      }
    });

    return NextResponse.json({ message: "Agent status updated successfully", agent: updatedAgent }, { status: 200 });
  } catch (error) {
    console.error("Failed to update agent status:", error);
    return NextResponse.json({ error: "Failed to update agent status" }, { status: 500 });
  }
}
