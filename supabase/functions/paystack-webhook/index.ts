import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') ?? '';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const SB_URL = Deno.env.get('SB_URL') ?? '';
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY);

async function verifyPaystackSignature(rawBody: string, signature: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(PAYSTACK_SECRET_KEY);
  const bodyData = encoder.encode(rawBody);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', cryptoKey, bodyData);
  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return computed === signature;
}

async function handleChargeSuccess(event: Record<string, unknown>) {
  const data = event.data as Record<string, unknown>;
  const metadata = data.metadata as Record<string, unknown> ?? {};
  const customer = data.customer as Record<string, unknown> ?? {};
  const authorization = data.authorization as Record<string, unknown> ?? {};
  const userId = metadata.user_id as string;
  const planId = metadata.plan_id as string;
  const billingCycle = metadata.billing_cycle as string;
  const reference = data.reference as string;
  const amount = data.amount as number;
  const paidAt = data.paid_at as string;
  if (!userId || !planId || !reference) {
    throw new Error('Missing required payment metadata');
  }
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('user_id', userId)
    .in('status', ['active', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const subscriptionData = {
    user_id: userId,
    plan_id: planId,
    status: 'active',
    billing_cycle: billingCycle ?? 'monthly',
    paystack_customer_code: customer.customer_code as string ?? null,
    paystack_subscription_code: data.subscription_code as string ?? null,
    start_date: paidAt ? new Date(paidAt).toISOString() : new Date().toISOString(),
    end_date: null,
    cancel_at_period_end: false,
    cancelled_at: null,
  };
  let subscriptionId: string;
  if (existingSubscription) {
    const { data: updatedSub } = await supabase
      .from('subscriptions')
      .update({ ...subscriptionData, updated_at: new Date().toISOString() })
      .eq('id', existingSubscription.id)
      .select('id')
      .single();
    subscriptionId = updatedSub?.id ?? existingSubscription.id;
  } else {
    const { data: newSub } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select('id')
      .single();
    subscriptionId = newSub?.id ?? '';
  }
  await supabase.from('payments').insert({
    subscription_id: subscriptionId,
    amount,
    currency: 'NGN',
    reference,
    status: 'success',
    payment_method: authorization.channel as string ?? null,
    paid_at: paidAt ? new Date(paidAt).toISOString() : new Date().toISOString(),
    gateway_response: data as Record<string, unknown>,
  });
  const { data: plan } = await supabase
    .from('plans')
    .select('monthly_price, yearly_price')
    .eq('id', planId)
    .single();
  const isYearly = billingCycle === 'yearly';
  const periodDays = isYearly ? 365 : 30;
  const periodStart = paidAt ? new Date(paidAt) : new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + periodDays);
  await supabase.from('invoices').insert({
    subscription_id: subscriptionId,
    amount,
    status: 'paid',
    period_start: periodStart.toISOString(),
    period_end: periodEnd.toISOString(),
    paid_at: new Date().toISOString(),
  });
}

async function handleChargeFailed(event: Record<string, unknown>) {
  const data = event.data as Record<string, unknown>;
  const reference = data.reference as string;
  if (!reference) return;
  await supabase
    .from('payment_attempts')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('reference', reference);
  await supabase.from('payments').insert({
    subscription_id: null,
    amount: (data.amount as number) ?? 0,
    currency: 'NGN',
    reference,
    status: 'failed',
    paid_at: null,
    gateway_response: data as Record<string, unknown>,
  });
}

async function handleSubscriptionNotRenew(event: Record<string, unknown>) {
  const data = event.data as Record<string, unknown>;
  const subscriptionCode = data.subscription_code as string;
  if (!subscriptionCode) return;
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan_id')
    .eq('paystack_subscription_code', subscriptionCode)
    .single();
  if (sub) {
    const { data: freePlan } = await supabase
      .from('plans')
      .select('id')
      .eq('slug', 'free')
      .single();
    await supabase
      .from('subscriptions')
      .update({
        status: 'expired',
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
        plan_id: freePlan?.id ?? sub.plan_id,
        end_date: new Date().toISOString(),
      })
      .eq('id', sub.id);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
    const rawBody = await req.text();
    const paystackSignature = req.headers.get('x-paystack-signature') ?? '';
    if (!paystackSignature) {
      return new Response('Missing signature', { status: 401, headers: corsHeaders });
    }
    const isValid = await verifyPaystackSignature(rawBody, paystackSignature);
    if (!isValid) {
      return new Response('Invalid signature', { status: 401, headers: corsHeaders });
    }
    const event = JSON.parse(rawBody);
    const eventType = event.event as string;
    const eventId = (event.data?.id as string) ?? `${eventType}-${Date.now()}`;
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id, status')
      .eq('idempotency_key', eventId)
      .maybeSingle();
    if (existingEvent) {
      return new Response('OK', { status: 200, headers: corsHeaders });
    }
    await supabase.from('webhook_events').insert({
      event_type: eventType,
      paystack_signature: paystackSignature,
      raw_body: event,
      status: 'received',
      idempotency_key: eventId,
    });
    try {
      switch (eventType) {
        case 'charge.success':
          await handleChargeSuccess(event);
          break;
        case 'charge.failed':
          await handleChargeFailed(event);
          break;
        case 'subscription.not_renew':
          await handleSubscriptionNotRenew(event);
          break;
      }
      await supabase
        .from('webhook_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('idempotency_key', eventId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await supabase
        .from('webhook_events')
        .update({ status: 'failed', error_message: errorMessage })
        .eq('idempotency_key', eventId);
    }
    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal server error', { status: 500, headers: corsHeaders });
  }
});
