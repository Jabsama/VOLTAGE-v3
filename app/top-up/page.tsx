// /app/top-up/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Offer = {
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
  pricePerHour: number;       // en USD
  stripePriceId?: string;     // facultatif, si vous avez pré-créé un Price dans Stripe
};

export default function TopUpPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const router = useRouter();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [selected, setSelected] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Charger les offres Célium
  useEffect(() => {
    fetch('/api/celium/offers')
      .then((r) => r.json())
      .then((data) => setOffers(data.offers))
      .catch((e) => {
        console.error(e);
        setError('Impossible de charger les offres GPU');
      });
  }, []);

  // 2) Créer la session Stripe et rediriger
  const handleCheckout = async () => {
    if (!selected || !userEmail) return;
    setLoading(true);
    setError(null);

    try {
      // Préparer le body en fonction de la dispo de stripePriceId
      const body: any = {
        userEmail,
        celiumOfferId: selected.id,
      };

      if (selected.stripePriceId) {
        body.planId = selected.stripePriceId;
      } else {
        body.price = Math.round(selected.pricePerHour * 100);
        body.productName = selected.name;
      }

      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const { url, error: srvErr } = await res.json();
      if (srvErr) throw new Error(srvErr);

      window.location.href = url;
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Erreur lors de la création de la session');
      setLoading(false);
    }
  };

  if (!offers.length) {
    return <p className="text-center p-4">Chargement des offres GPU...</p>;
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Choisissez votre offre GPU</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {offers.map((o) => (
          <li key={o.id}>
            <button
              onClick={() => setSelected(o)}
              className={`w-full text-left p-4 border rounded-lg hover:shadow ${
                selected?.id === o.id ? 'border-blue-600 bg-blue-50' : ''
              }`}
            >
              <h2 className="text-xl font-semibold mb-2">{o.name}</h2>
              <p>GPU: {o.specs.gpuCount}</p>
              <p>CPU: {o.specs.cpu}</p>
              <p>RAM: {o.specs.memory}</p>
              <p>Disque: {o.specs.disk}</p>
              <p>Réseau: {o.specs.network}</p>
              <p>Lieu: {o.specs.location}</p>
              <p className="mt-2 font-semibold">
                {o.pricePerHour.toFixed(2)} USD / heure
              </p>
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={handleCheckout}
        disabled={!selected || loading}
        className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-50"
      >
        {loading
          ? 'Redirection…'
          : selected
          ? `Payer ${selected.pricePerHour.toFixed(2)} USD pour 1 heure`
          : 'Sélectionnez une offre'}
      </button>
    </main>
  );
}
