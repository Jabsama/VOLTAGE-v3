import type { NextApiRequest, NextApiResponse } from 'next';
import { createCharge } from '../../../lib/coinbase';
import { verifyToken } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, podId, userToken } = req.body;

    // Validate input
    if (!amount || !podId) {
      return res.status(400).json({ error: 'Amount and podId are required' });
    }

    // Verify user token if provided
    let userId = null;
    if (userToken) {
      const decoded = verifyToken(userToken);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      userId = decoded.userId;
    }

    // Get pod details
    const pod = await prisma.pod.findUnique({
      where: { id: podId },
      select: {
        id: true,
        gpu_display: true,
        price: true,
      },
    });

    if (!pod) {
      return res.status(404).json({ error: 'Pod not found' });
    }

    // Create Coinbase Commerce charge
    const charge = await createCharge({
      name: `GPU Pod: ${pod.gpu_display}`,
      description: `Rent a ${pod.gpu_display} GPU pod on VoltageGPU`,
      amount: parseFloat(amount.toString()),
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/browse-pods?payment=cancelled`,
      metadata: {
        podId,
        userId,
      },
    });

    // Create order record in database
    if (userId) {
      await prisma.order.create({
        data: {
          userId,
          podId,
          amount: parseFloat(amount.toString()),
          paymentMethod: 'bitcoin',
          paymentId: charge.id,
          status: 'pending',
        },
      });
    }

    // Return hosted checkout URL
    return res.status(200).json({
      hosted_url: charge.hosted_url,
      id: charge.id,
    });
  } catch (error) {
    console.error('Coinbase checkout error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
