// Simple Coinbase Commerce API client
const COINBASE_API_URL = 'https://api.commerce.coinbase.com';

// Create a charge for Bitcoin payment
export async function createCharge({
  name,
  description,
  amount,
  currency = 'USD',
  redirectUrl,
  cancelUrl,
  metadata = {},
}: {
  name: string;
  description: string;
  amount: number;
  currency?: string;
  redirectUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}) {
  try {
    if (!process.env.COINBASE_COMMERCE_API_KEY) {
      throw new Error('COINBASE_COMMERCE_API_KEY is not set');
    }

    const chargeData = {
      name,
      description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: amount.toString(),
        currency,
      },
      redirect_url: redirectUrl,
      cancel_url: cancelUrl,
      metadata,
    };

    const response = await fetch(`${COINBASE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify(chargeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Coinbase API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating Coinbase Commerce charge:', error);
    throw error;
  }
}

// Verify a webhook from Coinbase Commerce
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
) {
  try {
    // In a real implementation, this would verify the HMAC signature
    // For now, we'll just return true for testing purposes
    console.warn('Webhook signature verification is not implemented');
    return true;
  } catch (error) {
    console.error('Error verifying Coinbase Commerce webhook signature:', error);
    return false;
  }
}
