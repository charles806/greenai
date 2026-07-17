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
    const { type } = await req.json();
    if (!type || !['chat', 'upload'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid type. Must be "chat" or "upload"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: subscription } = await supabase
      .rpc('get_current_plan', { p_user_id: user.id })
      .maybeSingle();
    let plan;
    if (subscription) {
      plan = subscription;
    } else {
      const { data: freePlan } = await supabase
        .from('plans')
        .select('*')
        .eq('slug', 'free')
        .single();
      plan = freePlan;
    }
    if (!plan) {
      return new Response(JSON.stringify({ error: 'No plan found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (type === 'chat') {
      if (plan.daily_chat_limit === -1) {
        return new Response(
          JSON.stringify({ allowed: true, remaining: -1, limit: -1, plan_slug: plan.slug }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: usageData } = await supabase
        .rpc('get_daily_chat_usage', { p_user_id: user.id, p_date: new Date().toISOString().split('T')[0] });
      const currentUsage = usageData ?? 0;
      const remaining = Math.max(0, plan.daily_chat_limit - currentUsage);
      return new Response(
        JSON.stringify({
          allowed: currentUsage < plan.daily_chat_limit,
          remaining,
          limit: plan.daily_chat_limit,
          plan_slug: plan.slug,
          current_usage: currentUsage,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (type === 'upload') {
      if (plan.upload_limit === -1) {
        return new Response(
          JSON.stringify({ allowed: true, remaining: -1, limit: -1, plan_slug: plan.slug }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: uploadCount } = await supabase
        .rpc('get_upload_count', { p_user_id: user.id });
      const currentUploads = uploadCount ?? 0;
      const remaining = Math.max(0, plan.upload_limit - currentUploads);
      return new Response(
        JSON.stringify({
          allowed: currentUploads < plan.upload_limit,
          remaining,
          limit: plan.upload_limit,
          plan_slug: plan.slug,
          current_usage: currentUploads,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ error: 'Invalid type' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Check quota error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
