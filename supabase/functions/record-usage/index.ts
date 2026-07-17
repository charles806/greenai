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
    if (req.method !== 'POST') {
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
    const { action, metadata } = await req.json();
    if (!action || !['chat_message', 'file_upload'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "chat_message" or "file_upload"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      action,
      metadata: metadata ?? {},
    });
    if (action === 'chat_message') {
      await supabase.rpc('increment_chat_usage', {
        p_user_id: user.id,
        p_date: new Date().toISOString().split('T')[0],
      });
    }
    const { data: currentPlan } = await supabase
      .rpc('get_current_plan', { p_user_id: user.id })
      .maybeSingle();
    const plan = currentPlan ?? await supabase
      .from('plans')
      .select('*')
      .eq('slug', 'free')
      .single()
      .then(r => r.data);
    let remaining = -1;
    if (action === 'chat_message' && plan && plan.daily_chat_limit !== -1) {
      const { data: usage } = await supabase
        .rpc('get_daily_chat_usage', { p_user_id: user.id, p_date: new Date().toISOString().split('T')[0] });
      remaining = Math.max(0, plan.daily_chat_limit - (usage ?? 0));
    }
    return new Response(
      JSON.stringify({ success: true, remaining, plan_slug: plan?.slug ?? 'free' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Record usage error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
