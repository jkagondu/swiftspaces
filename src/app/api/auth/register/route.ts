import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, agencyName, phoneNumber } = body;

    // 1. Validate input
    if (!email || !password || !agencyName) {
      return NextResponse.json({ error: "Email, password, and agency name are required" }, { status: 400 });
    }

    // 2. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create the Agent in the database
    const newAgent = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "AGENT",
        agencyName,
        phoneNumber,
        agentStatus: "PENDING" // Requires admin approval
      },
      select: {
        id: true,
        email: true,
        role: true,
        agencyName: true,
        agentStatus: true,
      }
    });

    return NextResponse.json(
      { message: "Registration successful. Please wait for admin approval.", user: newAgent }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
