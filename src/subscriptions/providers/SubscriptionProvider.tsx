import { createContext, useContext, type ReactNode } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import type { Plan, Subscription } from '../types';

interface SubscriptionContextType {
  loading: boolean;
  subscription: Subscription | null;
  plan: Plan | null;
  isPremium: boolean;
  cancelAtPeriodEnd: boolean;
  endDate: string | null;
  error: string | null;
  cancelSubscription: () => Promise<unknown>;
  refresh: () => Promise<void>;
  invalidateCache: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const subscriptionData = useSubscription();

  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext(): SubscriptionContextType {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }
  return context;
}
