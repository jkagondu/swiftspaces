import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, agencyName, phoneNumber, role } = body;

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

    // If requested role is ADMIN, ensure no other admin exists
    let assignedRole = "AGENT";
    let assignedStatus = "PENDING";
    
    if (role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" }
      });
      
      if (adminCount > 0) {
        return NextResponse.json({ error: "An admin account already exists. Only one admin is allowed." }, { status: 403 });
      }
      assignedRole = "ADMIN";
      assignedStatus = "ACTIVE";
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create the Agent/Admin in the database
    const newAgent = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: assignedRole as any,
        agencyName,
        phoneNumber,
        agentStatus: assignedStatus as any
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
