import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalAgents,
      pendingAgents,
      activeAgents,
      totalProperties,
      totalInquiries,
      recentInquiries,
      recentProperties,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'AGENT' } }),
      prisma.user.count({ where: { role: 'AGENT', agentStatus: 'PENDING' } }),
      prisma.user.count({ where: { role: 'AGENT', agentStatus: 'ACTIVE' } }),
      prisma.property.count(),
      prisma.inquiry.count(),
      // Latest 5 inquiries with property & agent info
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: { title: true, agent: { select: { agencyName: true } } }
          }
        }
      }),
      // Latest 5 properties listed
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          location: true,
          createdAt: true,
          agent: { select: { agencyName: true } }
        }
      })
    ]);

    return NextResponse.json({
      totalAgents,
      pendingAgents,
      activeAgents,
      totalProperties,
      totalInquiries,
      recentInquiries,
      recentProperties,
    });
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
