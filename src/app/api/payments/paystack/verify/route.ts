import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: "No reference provided" }, { status: 400 });
    }

    // 1. Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // 2. Update the user's subscription plan in our database
    const plan = data.data.metadata?.plan || "PREMIUM";

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionPlan: plan,
      }
    });

    // 3. Log the payment activity
    await prisma.activityLog.create({
      data: {
        action: "SUBSCRIPTION_UPGRADED",
        details: `Agent ${updatedUser.agencyName || updatedUser.email} upgraded to ${plan} plan via Paystack.`,
        userId: updatedUser.id
      }
    });

    return NextResponse.json({ message: "Payment verified successfully", plan: updatedUser.subscriptionPlan });
    
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
