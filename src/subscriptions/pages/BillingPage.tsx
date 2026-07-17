import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, CreditCard, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { useSubscriptionContext } from '../providers/SubscriptionProvider';
import { BillingHistory } from '../components/BillingHistory';
import { formatPrice } from '../utils/quota';

export function BillingPage() {
  const navigate = useNavigate();
  const {
    loading,
    subscription,
    plan,
    isPremium,
    cancelAtPeriodEnd,
    endDate,
    error,
    cancelSubscription,
    invalidateCache,
  } = useSubscriptionContext();
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      setCancelSuccess(true);
      setShowCancelConfirm(false);
      invalidateCache();
    } catch {
      setCancelSuccess(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your subscription and payment history</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`rounded-xl p-3 ${
                  isPremium
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {isPremium ? (
                    <Crown className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CreditCard className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {plan?.display_name ?? 'Free'} Plan
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {plan?.model_name ?? 'GX 1.5'}
                  </p>
                  {isPremium && subscription?.billing_cycle && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {subscription.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'} billing
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isPremium && cancelAtPeriodEnd && endDate && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                Your subscription will end on {new Date(endDate).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}. You will be downgraded to the Free plan.
              </div>
            )}

            {cancelSuccess && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                Subscription cancelled. You'll retain premium access until the end of your billing period.
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {!isPremium && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Upgrade
                </button>
              )}
              {isPremium && !cancelAtPeriodEnd && !cancelSuccess && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="rounded-lg border border-red-200 dark:border-red-800 px-6 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>
            <BillingHistory />
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plan Limits</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Model</span>
                <span className="font-medium text-gray-900 dark:text-white">{plan?.model_name ?? 'GX 1.5'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Daily messages</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {plan?.daily_chat_limit === -1 ? 'Unlimited' : plan?.daily_chat_limit ?? 100}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">File uploads</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {plan?.upload_limit === -1 ? 'Unlimited' : plan?.upload_limit ?? 2}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Max file size</span>
                <span className="font-medium text-gray-900 dark:text-white">10 MB</span>
              </div>
              {isPremium && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Price</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {subscription?.billing_cycle === 'yearly'
                      ? formatPrice(plan?.yearly_price ?? 0) + '/year'
                      : formatPrice(plan?.monthly_price ?? 0) + '/month'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cancel Subscription?</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You will retain premium access until the end of your current billing period, then be downgraded to the Free plan. Your uploaded files will not be deleted.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Keep Plan
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
