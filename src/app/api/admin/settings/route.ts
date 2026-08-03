import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let settings = await prisma.platformSettings.findUnique({
      where: { id: "singleton" }
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: "singleton",
          supportEmail: "support@swiftspace.africa",
          supportPhone: "+254 700 000000"
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { supportEmail, supportPhone } = await request.json();

    const updated = await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: {
        supportEmail,
        supportPhone
      },
      create: {
        id: "singleton",
        supportEmail,
        supportPhone
      }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: "SETTINGS_UPDATED",
        details: `Platform settings (Support Contact) updated by Admin.`,
        userId: (session.user as any)?.id
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
