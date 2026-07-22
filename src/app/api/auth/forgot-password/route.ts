import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

// Only initialize Resend if the API key is present
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration attacks
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save to database
    await prisma.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry }
    });

    // Send email via Resend
    const resetUrl = `${process.env.NEXTAUTH_URL || 'https://swiftspace.africa'}/reset-password?token=${resetToken}`;
    
    if (resend) {
      await resend.emails.send({
        from: 'SwiftSpaces <onboarding@resend.dev>',
        to: email,
        subject: 'SwiftSpaces - Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your SwiftSpaces account.</p>
          <p>Click the link below to securely reset your password. This link will expire in 1 hour.</p>
          <br/>
          <a href="${resetUrl}" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <br/><br/>
          <p>If you did not request this, please ignore this email.</p>
        `
      });
    } else {
      console.log("No RESEND_API_KEY set. Here is the generated Reset URL:", resetUrl);
    }

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
