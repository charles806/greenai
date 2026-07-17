import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';
import type { Payment } from '../types';

export function BillingHistory() {
  const { user, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        const { data } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setPayments((data ?? []) as Payment[]);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">No payment history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center gap-3">
            {payment.status === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            ) : payment.status === 'failed' ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                ₦{(payment.amount / 100).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(payment.created_at).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
                {payment.payment_method && ` · ${payment.payment_method}`}
              </p>
            </div>
          </div>
          <span className={`text-xs font-medium capitalize ${
            payment.status === 'success'
              ? 'text-emerald-600 dark:text-emerald-400'
              : payment.status === 'failed'
                ? 'text-red-600 dark:text-red-400'
                : 'text-amber-600 dark:text-amber-400'
          }`}>
            {payment.status}
          </span>
        </div>
      ))}
    </div>
  );
}
