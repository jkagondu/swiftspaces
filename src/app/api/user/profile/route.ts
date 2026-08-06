import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        facebookUrl: body.facebookUrl !== undefined ? body.facebookUrl : undefined,
        twitterUrl: body.twitterUrl !== undefined ? body.twitterUrl : undefined,
        instagramUrl: body.instagramUrl !== undefined ? body.instagramUrl : undefined,
        linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : undefined,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
