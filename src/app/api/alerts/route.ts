import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

// Configure Zoho SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com', // or smtp.zoho.africa
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.ZOHO_EMAIL || 'support@swiftspace.africa',
    pass: process.env.ZOHO_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email, query } = await request.json();

    if (!email || !query) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const subscription = await prisma.alertSubscription.create({
      data: {
        email,
        query: JSON.stringify(query), // Store search params as JSON
      }
    });

    // If it's a newsletter subscription, send a welcome email!
    if (query.type === 'newsletter') {
      try {
        await transporter.sendMail({
          from: `"SwiftSpaces" <${process.env.ZOHO_EMAIL || 'support@swiftspace.africa'}>`,
          to: email,
          subject: "Welcome to the SwiftSpaces Inner Circle! 🌟",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #0f172a;">Welcome to the Inner Circle!</h1>
              <p>Hi there,</p>
              <p>Thank you for subscribing to the SwiftSpaces newsletter. You are now officially part of our Inner Circle!</p>
              <p>You'll be the first to know about:</p>
              <ul>
                <li>Exclusive premium property listings</li>
                <li>Off-market investment opportunities</li>
                <li>Market insights and trends</li>
              </ul>
              <p>We're thrilled to have you with us.</p>
              <br/>
              <p>Best regards,</p>
              <p><strong>The SwiftSpaces Team</strong></p>
              <p><a href="https://swiftspace.africa" style="color: #10b981;">www.swiftspace.africa</a></p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // We don't want to fail the whole request if just the email fails
      }
    }

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error creating alert subscription:", error);
    return NextResponse.json({ error: "Failed to save search" }, { status: 500 });
  }
}
