// lib/auth.ts
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import jwt from 'jsonwebtoken';

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  let payload: any;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }

  const email = payload.sub?.email;
  if (!email) return null;

  // find or create user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // créer customer Stripe
    const stripe = new (await import('stripe')).Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });
    const customer = await stripe.customers.create({ email });
    user = await prisma.user.create({
      data: { email, stripeCustomerId: customer.id }
    });
  }
  return user;
}
