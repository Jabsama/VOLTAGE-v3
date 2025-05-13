'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import './orders.module.css';

type Order = {
  id: string;
  celiumOrderId: string;
  status: string;
  priceClient: number;
  hours: number;
  createdAt: string;
};

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  // Fetch orders
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/orders')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch orders');
          return res.json();
        })
        .then(data => setOrders(data.orders))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [status]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="orders-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </Link>
        <h1>My Orders</h1>
      </div>

      {error ? (
        <div className="error-message">
          <AlertCircle size={18} />
          <span>Failed to load orders</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You haven't placed any orders yet.</p>
          <Link href="/browse-pods" className="browse-link">
            Browse available GPUs
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{formatDate(order.createdAt)}</td>
                  <td title={order.celiumOrderId}>
                    {order.celiumOrderId.substring(0, 8)}...
                  </td>
                  <td>{order.hours}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>${order.priceClient.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
