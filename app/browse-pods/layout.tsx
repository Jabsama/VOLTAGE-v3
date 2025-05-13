'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function BrowsePodsLayout({ children }: { children: React.ReactNode }) {
  const [stripe, setStripe] = useState<ReturnType<typeof loadStripe> | null>(null);

  // 1️⃣ Charge Stripe.js
  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      .then((s) => setStripe(s))
      .catch(console.error);
  }, []);

  // 2️⃣ Dès que stripe est prêt, on "patch" les boutons
  useEffect(() => {
    if (!stripe) return;

    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.btn-rent[data-pod-id]')
    );
    const handlers: Array<() => void> = [];

    buttons.forEach((btn) => {
      const handler = async () => {
        const planId = btn.dataset.podId;
        if (!planId) {
          alert('ID de pod manquant');
          return;
        }

        const userEmail = prompt('Ton email pour l’accès GPU ?');
        if (!userEmail) return;

        btn.disabled = true;
        btn.textContent = 'Patiente…';

        try {
          const res = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId, userEmail }),
          });
          const { url, error } = await res.json();
          if (error) throw new Error(error);

          window.location.href = url;
        } catch (e: any) {
          console.error(e);
          alert(e.message || 'Erreur lors du paiement');
          btn.disabled = false;
          btn.textContent = 'Rent now';
        }
      };

      btn.addEventListener('click', handler);
      handlers.push(() => btn.removeEventListener('click', handler));
    });

    return () => {
      handlers.forEach((off) => off());
    };
  }, [stripe]);

  // 3️⃣ On rend le contenu (ta page) inchangé
  return <>{children}</>;
}