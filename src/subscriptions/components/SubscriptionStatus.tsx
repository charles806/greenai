import { Crown, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useSubscriptionContext } from '../providers/SubscriptionProvider';

export function SubscriptionStatus() {
  const { loading, subscription, plan, isPremium, cancelAtPeriodEnd, endDate, error } = useSubscriptionContext();

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        Loading...
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (isPremium) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
        <Crown className="h-4 w-4" />
        <span className="font-medium">{plan?.display_name ?? 'Premium'}</span>
        {cancelAtPeriodEnd && endDate && (
          <>
            <Clock className="ml-2 h-4 w-4" />
            <span className="text-emerald-600 dark:text-emerald-500">
              Cancels {new Date(endDate).toLocaleDateString()}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
      <CheckCircle2 className="h-4 w-4" />
      <span>Free Plan</span>
      <span className="text-gray-400">·</span>
      <span className="text-gray-500">{plan?.model_name ?? 'GX 1.5'}</span>
    </div>
  );
}
