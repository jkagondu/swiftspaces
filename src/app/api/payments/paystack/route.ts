import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, amount } = await request.json();

    // 1. Prepare Paystack payload
    const params = JSON.stringify({
      email: session.user.email,
      amount: amount * 100, // Paystack expects amount in Kobo/Cents
      callback_url: `${process.env.NEXTAUTH_URL}/manager?payment=success`,
      metadata: {
        userId: (session.user as any).id,
        plan: plan,
      }
    });

    // 2. Initialize transaction with Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: params
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }

    // 3. Return the authorization URL to redirect the user
    return NextResponse.json({ authorization_url: data.data.authorization_url });
    
  } catch (error) {
    console.error("Payment initialization failed:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
