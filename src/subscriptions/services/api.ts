import { supabase } from '../../lib/supabase';
import type {
  Plan,
  InitializePaymentResponse,
  GetSubscriptionResponse,
  QuotaResult,
  UsageRecordResponse,
} from '../types';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;

async function callFunction<T>(name: string, options?: {
  method?: string;
  body?: Record<string, unknown>;
}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  const url = `${FUNCTIONS_URL}/${name}`;
  const method = options?.method ?? 'POST';

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (options?.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorBody.error ?? `HTTP ${response.status}`);
  }

  return response.json();
}

export async function listPlans(): Promise<{ plans: Plan[] }> {
  return callFunction('list-plans', { method: 'GET' });
}

export async function getSubscription(): Promise<GetSubscriptionResponse> {
  return callFunction('get-subscription', { method: 'GET' });
}

export async function initializePayment(planId: string, billingCycle: 'monthly' | 'yearly'): Promise<InitializePaymentResponse> {
  return callFunction('initialize-payment', {
    body: { plan_id: planId, billing_cycle: billingCycle },
  });
}

export async function cancelSubscription(): Promise<{ subscription: unknown }> {
  return callFunction('cancel-subscription');
}

export async function checkQuota(type: 'chat' | 'upload'): Promise<QuotaResult> {
  return callFunction('check-quota', {
    body: { type },
  });
}

export async function recordUsage(action: 'chat_message' | 'file_upload', metadata?: Record<string, unknown>): Promise<UsageRecordResponse> {
  return callFunction('record-usage', {
    body: { action, metadata },
  });
}
