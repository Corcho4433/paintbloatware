import { useState, useEffect } from 'react';
import { serverPath } from '../utils/servers';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  paymentMethod: string;
  transactionId: string;
  created_at: string;
}

interface Subscription {
  id: string;
  amount: number;
  userId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  transactionId: string;
  cancelAtPeriodEnd: boolean;
  created_at: string;
  updated_at: string;
}

export const usePaymentHistory = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${serverPath}/api/payment`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch payments');
        }

        const result = await response.json();
        setPayments(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return { payments, loading, error };
};

export const usePaymentSummary = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${serverPath}/api/payment/summary`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch summary');
        }

        const result = await response.json();
        setSummary(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return { summary, loading, error };
};

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${serverPath}/api/subscribe/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const result = await response.json();
      setSubscription(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const refetch = () => {
    fetchSubscription();
  };

  return { subscription, loading, error, refetch };
};

export const cancelSubscription = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${serverPath}/api/subscribe/cancel`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }

    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};