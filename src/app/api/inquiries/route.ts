import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: Fetch all inquiries for the logged-in agent
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await prisma.inquiry.findMany({
      where: {
        property: {
          agentId: (session.user as any).id
        }
      },
      include: {
        property: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

// POST: Customer submitting an inquiry for a property
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, propertyId } = body;

    if (!name || !email || !message || !propertyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { agent: true }
    });

    if (!property || !property.agent) {
      return NextResponse.json({ error: "Property or Agent not found" }, { status: 404 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        message,
        propertyId
      }
    });

    // Send Email via Resend if API Key is configured
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      try {
        await resend.emails.send({
          from: 'SwiftSpaces Leads <onboarding@resend.dev>', // Use onboarding email for testing without a domain
          to: property.agent.email,
          subject: `New Lead: ${property.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #0F172A; padding: 20px; color: white;">
                <h2 style="margin: 0;">New Property Inquiry</h2>
                <p style="margin: 5px 0 0 0; color: #94a3b8;">${property.title}</p>
              </div>
              <div style="padding: 20px; background-color: white;">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <div style="margin-top: 20px; padding: 15px; background-color: #F4F6F9; border-left: 4px solid #10B981; border-radius: 4px;">
                  <p style="margin: 0; color: #1E293B;">"${message}"</p>
                </div>
                <p style="margin-top: 20px; font-size: 14px; color: #64748B;">Log in to your SwiftSpaces Manager Portal to respond to this lead.</p>
              </div>
            </div>
          `
        });
      } catch (emailErr) {
        console.error("Resend Email Error:", emailErr);
        // Do not fail the API request if the email fails
      }
    } else {
      console.log("Skipping email notification: RESEND_API_KEY is not defined.");
    }

    return NextResponse.json({ message: "Inquiry sent successfully!", inquiry }, { status: 201 });
  } catch (error) {
    console.error("Failed to create inquiry:", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
