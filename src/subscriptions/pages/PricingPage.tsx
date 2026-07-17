import { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAuthModal } from '../../auth/providers/AuthModalProvider';
import { listPlans, initializePayment } from '../services/api';
import { useSubscriptionContext } from '../providers/SubscriptionProvider';
import { PricingCard } from '../components/PricingCard';
import type { Plan } from '../types';

export function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showAuthModal } = useAuthModal();
  const { isPremium, plan: currentPlan, invalidateCache } = useSubscriptionContext();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await listPlans();
        setPlans(response.plans);
      } catch {
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSelect = async (plan: Plan, cycle: 'monthly' | 'yearly') => {
    if (!isAuthenticated) {
      showAuthModal({ title: 'Sign in to upgrade', description: 'Create an account or sign in to subscribe to a plan.' });
      return;
    }

    if (plan.slug === 'free') {
      return;
    }

    setProcessing(plan.id);

    try {
      const response = await initializePayment(plan.id, cycle);
      invalidateCache();
      window.location.href = response.authorization_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      alert(message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </button>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 p-3">
              <Zap className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="mt-4 text-4xl font-bold text-gray-900 dark:text-white">
              Simple, transparent pricing
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              Choose the plan that fits your needs. Upgrade or cancel anytime.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                Yearly <span className="text-emerald-500 text-xs font-semibold">Save 20%</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-16 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {plans.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelect}
                  billingCycle={billingCycle}
                  isCurrentPlan={isPremium && currentPlan?.slug === plan.slug}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 text-center shadow-xl">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
            <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              Redirecting to payment...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
