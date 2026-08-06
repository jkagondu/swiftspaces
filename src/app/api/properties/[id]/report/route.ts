import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        propertyId: id,
        reason: reason.trim(),
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error reporting property:', error);
    return NextResponse.json({ error: 'Failed to report property' }, { status: 500 });
  }
}
