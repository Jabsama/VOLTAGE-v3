'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Bitcoin, Loader } from 'lucide-react';
import Button from './Button';

interface PaymentOptionsProps {
  podId: string;
  price: number;
  onClose?: () => void;
}

export default function PaymentOptions({ podId, price, onClose }: PaymentOptionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Stripe payment
  const handleStripePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user email (in a real app, this would come from the user's session)
      const userEmail = prompt('Please enter your email');
      if (!userEmail) {
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: podId, userEmail }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error('Invalid response from checkout_sessions');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle Bitcoin payment
  const handleBitcoinPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is logged in
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      // If not logged in, redirect to register page
      if (!token) {
        router.push(`/auth/register?redirect=bitcoin&podId=${podId}&amount=${price}`);
        return;
      }
      
      // Create Coinbase Commerce charge
      const response = await fetch('/api/coinbase/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          podId,
          userToken: token,
        }),
      });
      
      const data = await response.json();
      
      if (data.hosted_url) {
        window.location.assign(data.hosted_url);
      } else {
        throw new Error('Invalid response from coinbase/checkout');
      }
    } catch (err) {
      console.error('Bitcoin payment error:', err);
      setError('Failed to process Bitcoin payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-bg-dark rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6 text-center">Choose Payment Method</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center"
          onClick={handleStripePayment}
          disabled={loading}
          ariaLabel="Pay with credit or debit card via Stripe"
        >
          {loading ? (
            <Loader className="animate-spin mr-2" size={20} />
          ) : (
            <CreditCard className="mr-2" size={20} />
          )}
          Pay with Card
        </Button>
        
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-bg-light"></div>
          <span className="flex-shrink mx-4 text-text-secondary">or</span>
          <div className="flex-grow border-t border-bg-light"></div>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-center"
          onClick={handleBitcoinPayment}
          disabled={loading}
          ariaLabel="Pay with Bitcoin via Coinbase Commerce"
        >
          {loading ? (
            <Loader className="animate-spin mr-2" size={20} />
          ) : (
            <Bitcoin className="mr-2" size={20} />
          )}
          Pay with Bitcoin
        </Button>
      </div>
      
      {onClose && (
        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Cancel payment"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
