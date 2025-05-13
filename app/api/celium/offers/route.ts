// app/api/celium/offers/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

type CeliumRawOffer = {
  id: string;
  name: string;
  specs: {
    gpuCount: string;
    cpu: string;
    memory: string;
    disk: string;
    network: string;
    location: string;
  };
  pricing: {
    hourly: number;
  };
  stripePriceId?: string;
};

type Offer = {
  id: string;
  name: string;
  specs: CeliumRawOffer["specs"];
  pricePerHour: number;
  stripePriceId?: string;
};

export async function GET() {
  // Vérification de l'authentification
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  // 1️⃣ Appel à l’API Célium (executors)
  const res = await fetch('https://celiumcompute.ai/api/executors', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CELIUM_API_KEY}`,
    },
  });

  if (!res.ok) {
    console.error('Celium API error:', await res.text());
    return NextResponse.json(
      { error: 'Impossible de récupérer les offres Célium' },
      { status: 502 }
    );
  }

  // 2️⃣ On mappe le JSON brut vers notre schéma interne
  const data: CeliumRawOffer[] = await res.json();
  const offers: Offer[] = data.map((o) => ({
    id: o.id,
    name: o.name,
    specs: o.specs,
    pricePerHour: o.pricing.hourly,
    stripePriceId: o.stripePriceId,
  }));

  // 3️⃣ On renvoie la liste au front
  return NextResponse.json({ offers });
}
