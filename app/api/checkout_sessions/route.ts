// app/api/checkout_sessions/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export const config = { api: { bodyParser: true } };

export async function POST(req: Request) {
  const body = await req.json();
  const email = body.email || body.userEmail;
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  // Deux cas : top-up via `amount` OU checkout de pod via `planId`
  let session: Stripe.Checkout.Session;
  if (body.amount) {
    // Top-up simple (paiement unique)
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Top-up VoltageGPU balance' },
            unit_amount: body.amount, // en cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=topup`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=topup`,
    });
  } else if (body.planId) {
    // Checkout pour louer un pod
    session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // ou 'payment' selon ton implémentation
      customer_email: email,
      line_items: [{ price: body.planId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=pod`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/browse-pods?canceled=pod`,
    });
  } else {
    return NextResponse.json({ error: 'Missing amount or planId' }, { status: 400 });
  }

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
