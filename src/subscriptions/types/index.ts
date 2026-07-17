export interface Plan {
  id: string;
  slug: string;
  display_name: string;
  monthly_price: number;
  yearly_price: number;
  model_name: string;
  upload_limit: number;
  daily_chat_limit: number;
  max_file_size: number;
  active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  billing_cycle: 'monthly' | 'yearly' | 'free' | null;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  start_date: string;
  end_date: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  plans?: Plan;
}

export interface SubscriptionWithPlan extends Subscription {
  plans: Plan;
}

export interface QuotaResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  plan_slug: string;
  current_usage?: number;
}

export interface InitializePaymentResponse {
  authorization_url: string;
  reference: string;
  access_code: string;
  payment_attempt_id: string;
}

export interface GetSubscriptionResponse {
  subscription: SubscriptionWithPlan | null;
  plan: Plan;
  is_premium: boolean;
  cancel_at_period_end?: boolean;
  end_date?: string | null;
  expired?: boolean;
}

export interface UsageRecordResponse {
  success: boolean;
  remaining: number;
  plan_slug: string;
}

export interface PaymentAttempt {
  id: string;
  user_id: string;
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  reference: string;
  authorization_url: string | null;
  access_code: string | null;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  reference: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}

export const REJECTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const REJECTED_EXTENSIONS = ['.docx', '.doc', '.xlsx', '.xls'];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
