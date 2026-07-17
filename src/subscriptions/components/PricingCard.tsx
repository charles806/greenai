import { Check, X, Sparkles } from 'lucide-react';
import type { Plan } from '../types';
import { formatPrice, isPremiumPlan } from '../utils/quota';

interface PricingCardProps {
  plan: Plan;
  onSelect: (plan: Plan, billingCycle: 'monthly' | 'yearly') => void;
  billingCycle: 'monthly' | 'yearly';
  isCurrentPlan?: boolean;
}

const planFeatures: Record<string, { text: string; included: boolean }[]> = {
  free: [
    { text: 'GX 1.5 Model', included: true },
    { text: '100 AI messages/day', included: true },
    { text: '2 file uploads', included: true },
    { text: '10 MB/file size limit', included: true },
    { text: 'DOCX support', included: false },
    { text: 'Excel support', included: false },
  ],
  pro: [
    { text: 'GX 2.0 Model', included: true },
    { text: 'Unlimited AI messages', included: true },
    { text: '20 file uploads', included: true },
    { text: '10 MB/file size limit', included: true },
    { text: 'Priority support', included: true },
    { text: 'Advanced features', included: true },
  ],
  max: [
    { text: 'GX 3.0 Model', included: true },
    { text: 'Unlimited AI messages', included: true },
    { text: 'Unlimited file uploads', included: true },
    { text: '10 MB/file size limit', included: true },
    { text: 'Priority support', included: true },
    { text: 'Early access to features', included: true },
  ],
};

export function PricingCard({ plan, onSelect, billingCycle, isCurrentPlan }: PricingCardProps) {
  const price = billingCycle === 'yearly' ? plan.yearly_price : plan.monthly_price;
  const isFree = !isPremiumPlan(plan);
  const features = planFeatures[plan.slug] ?? [];

  return (
    <div className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ${
      isCurrentPlan
        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-md'
    }`}>
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white">
            <Sparkles className="h-3 w-3" />
            Current Plan
          </span>
        </div>
      )}

      {plan.slug === 'max' && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-medium text-white">
            Best Value
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.display_name}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{plan.model_name}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {isFree ? 'Free' : formatPrice(price)}
          </span>
          {!isFree && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              /{billingCycle === 'yearly' ? 'year' : 'month'}
            </span>
          )}
        </div>
        {!isFree && billingCycle === 'yearly' && (
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
            Save {Math.round((1 - plan.yearly_price / (plan.monthly_price * 12)) * 100)}% vs monthly
          </p>
        )}
      </div>

      <ul className="mb-8 space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature.text} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
            ) : (
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-300 dark:text-gray-600" />
            )}
            <span className={`text-sm ${
              feature.included
                ? 'text-gray-700 dark:text-gray-300'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan, billingCycle)}
        disabled={isCurrentPlan}
        className={`w-full rounded-lg py-3 text-sm font-semibold transition-all duration-200 ${
          isCurrentPlan
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
            : isFree
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : isFree ? 'Get Started Free' : 'Upgrade'}
      </button>
    </div>
  );
}
