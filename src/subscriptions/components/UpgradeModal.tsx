import { useState, useCallback } from 'react';
import { X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { initializePayment } from '../services/api';
import { useSubscriptionContext } from '../providers/SubscriptionProvider';
import type { Plan } from '../types';
import { formatPrice } from '../utils/quota';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const { invalidateCache } = useSubscriptionContext();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'processing' | 'success' | 'error'>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    if (!selectedPlan) return;

    setStep('processing');
    setErrorMessage(null);

    try {
      const response = await initializePayment(selectedPlan.id, billingCycle);
      setStep('success');

      const paystackPopup = (window as unknown as Record<string, unknown>).PaystackPop;
      if (paystackPopup && typeof paystackPopup === 'function') {
        const handler = new (paystackPopup as new (config: Record<string, unknown>) => { openIframe: () => void })({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: '',
          amount: billingCycle === 'yearly' ? selectedPlan.yearly_price : selectedPlan.monthly_price,
          currency: 'NGN',
          ref: response.reference,
          onClose: () => {
            setStep('select');
          },
          callback: () => {
            invalidateCache();
            setTimeout(() => onClose(), 2000);
          },
        });
        handler.openIframe();
      } else {
        window.location.href = response.authorization_url;
      }

      invalidateCache();
      setTimeout(() => onClose(), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment initialization failed';
      setErrorMessage(message);
      setStep('error');
    }
  }, [selectedPlan, billingCycle, invalidateCache, onClose]);

  const reset = useCallback(() => {
    setStep('select');
    setSelectedPlan(null);
    setErrorMessage(null);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {step === 'select' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Choose your plan</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select a plan that works for you
              </p>

              {!billingCycle && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:border-emerald-300 dark:hover:border-emerald-600"
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium hover:border-emerald-300 dark:hover:border-emerald-600"
                  >
                    Yearly (Save up to 25%)
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && selectedPlan && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Upgrade</h2>
              <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedPlan.display_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPlan.model_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(billingCycle === 'yearly' ? selectedPlan.yearly_price : selectedPlan.monthly_price)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  {errorMessage}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Redirecting to payment...</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You will be redirected to Paystack to complete payment
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-500" />
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Payment Successful!</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your subscription has been activated. Welcome!
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="flex flex-col items-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Payment Failed</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {errorMessage ?? 'An error occurred. Please try again.'}
              </p>
              <button
                onClick={reset}
                className="mt-6 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
