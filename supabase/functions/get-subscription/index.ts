import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const SB_URL = Deno.env.get('SB_URL') ?? '';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const SB_SERVICE_ROLE_KEY = Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(SB_URL, SB_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', user.id)
      .in('status', ['active', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch subscription' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!subscription) {
      const { data: freePlan } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', 'free')
        .single();
      return new Response(
        JSON.stringify({
          subscription: null,
          plan: freePlan,
          is_premium: false,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const now = new Date();
    const endDate = subscription.end_date ? new Date(subscription.end_date) : null;
    const isExpired = subscription.status === 'cancelled' && endDate && endDate < now;
    if (isExpired) {
      const { data: freePlan } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', 'free')
        .single();
      return new Response(
        JSON.stringify({
          subscription,
          plan: freePlan,
          expired: true,
          is_premium: false,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const isPremium = subscription.status === 'active' && subscription.plans?.slug !== 'free';
    return new Response(
      JSON.stringify({
        subscription,
        plan: subscription.plans,
        is_premium: isPremium,
        cancel_at_period_end: subscription.cancel_at_period_end,
        end_date: subscription.end_date,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get subscription error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
