// /app/api/webhooks/stripe/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import type { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as any,
});

// Init Prisma and Resend
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY!);

async function buffer(req: NextRequest) {
  const buf = await req.arrayBuffer();
  return Buffer.from(buf);
}

export default async function handler(req: NextRequest) {
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
    const userEmail = session.metadata!.userEmail as string;
    const celiumOfferId = session.metadata!.celiumOfferId as string;
    const userId = session.metadata!.userId as string;
    const hours = parseInt(session.metadata!.hours || '1', 10);

    try {
      // 1) Lancer la location Célium
      const celiumRes = await fetch(`https://celiumcompute.ai/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CELIUM_API_KEY}`,
        },
        body: JSON.stringify({
          offerId: celiumOfferId,
          hours: hours
        }),
      });
      
      if (!celiumRes.ok) throw new Error(await celiumRes.text());
      const celiumOrder = await celiumRes.json();
      
      // 2) Enregistrer la commande en base de données
      await prisma.order.create({
        data: {
          userId: userId,
          celiumOrderId: celiumOrder.id,
          status: celiumOrder.status,
          priceClient: session.amount_total ? session.amount_total / 100 : 0,
          priceProvider: celiumOrder.price,
          hours: hours
        }
      });

      // 3) Envoyer le mail via Resend
      await resend.emails.send({
        from: 'Voltage GPU <no-reply@voltagegpu.com>',
        to: userEmail,
        subject: 'Votre commande GPU Célium est confirmée 🚀',
        html: `
          <p>Bonjour,</p>
          <p>Votre commande GPU a été confirmée avec succès.</p>
          <ul>
            <li><strong>ID de commande Celium:</strong> ${celiumOrder.id}</li>
            <li><strong>Statut:</strong> ${celiumOrder.status}</li>
            <li><strong>Durée:</strong> ${hours} heure(s)</li>
          </ul>
          <p>Vous pouvez suivre votre commande dans votre espace "Mes commandes".</p>
        `,
      });

      console.log('✅ Mail envoyé via Resend à', userEmail);
    } catch (err: any) {
      console.error('❌ Erreur post-checkout:', err);
    }
  }

  return NextResponse.json({ received: true });
}
