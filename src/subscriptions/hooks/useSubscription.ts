import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getSubscription, cancelSubscription as cancelSubApi } from '../services/api';
import type { GetSubscriptionResponse, Plan, Subscription } from '../types';

const CACHE_KEY = 'cached_subscription';
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData {
  data: GetSubscriptionResponse;
  timestamp: number;
}

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSubscription(null);
      setPlan(null);
      setIsPremium(false);
      setLoading(false);
      return;
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedData = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          applyResponse(parsed.data);
          setLoading(false);
          return;
        }
      }

      const response = await getSubscription();
      applyResponse(response);

      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: response,
        timestamp: Date.now(),
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscription';
      setError(message);

      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedData = JSON.parse(cached);
        applyResponse(parsed.data);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const applyResponse = (response: GetSubscriptionResponse) => {
    setSubscription(response.subscription as Subscription | null);
    setPlan(response.plan);
    setIsPremium(response.is_premium);
    setCancelAtPeriodEnd(response.cancel_at_period_end ?? false);
    setEndDate(response.end_date ?? null);
  };

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const cancelSubscription = useCallback(async () => {
    try {
      const response = await cancelSubApi();
      setCancelAtPeriodEnd(true);
      localStorage.removeItem(CACHE_KEY);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      throw new Error(message);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    loading,
    subscription,
    plan,
    isPremium,
    cancelAtPeriodEnd,
    endDate,
    error,
    cancelSubscription,
    refresh: fetchSubscription,
    invalidateCache,
  };
}
