// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as any,
});

// Init Prisma
const prisma = new PrismaClient();

async function buffer(req: NextRequest) {
  const buf = await req.arrayBuffer();
  return Buffer.from(buf);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (e: any) {
    console.error('❌ Webhook signature invalide', e.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Check if this is a top-up transaction
    if (session.metadata?.type === 'topup') {
      const userId = session.metadata.userId;
      const amount = parseFloat(session.metadata.amount);
      
      try {
        // Create a transaction record for the top-up using raw SQL
        await prisma.$executeRaw`
          INSERT INTO "Transaction" ("id", "userId", "type", "amount", "createdAt")
          VALUES (gen_random_uuid(), ${userId}, 'topup', ${amount}, NOW())
        `;
        
        console.log(`✅ Top-up transaction recorded for user ${userId}: $${amount}`);
      } catch (err: any) {
        console.error('❌ Error recording top-up transaction:', err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
