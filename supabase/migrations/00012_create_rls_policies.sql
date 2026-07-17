-- Ensure RLS is enabled on all tables
ALTER TABLE IF EXISTS public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.daily_chat_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.file_uploads ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND (end_date IS NULL OR end_date > now())
  );
END;
$$;

-- Helper function to get user's current plan
CREATE OR REPLACE FUNCTION public.get_current_plan(p_user_id UUID)
RETURNS TABLE (
  plan_id UUID,
  slug TEXT,
  display_name TEXT,
  model_name TEXT,
  upload_limit INTEGER,
  daily_chat_limit INTEGER,
  max_file_size INTEGER,
  monthly_price INTEGER,
  yearly_price INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.display_name,
    p.model_name,
    p.upload_limit,
    p.daily_chat_limit,
    p.max_file_size,
    p.monthly_price,
    p.yearly_price
  FROM public.plans p
  INNER JOIN public.subscriptions s ON s.plan_id = p.id
  WHERE s.user_id = p_user_id
    AND s.status = 'active'
    AND (s.end_date IS NULL OR s.end_date > now())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get daily chat usage for a user
CREATE OR REPLACE FUNCTION public.get_daily_chat_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT count INTO v_count
  FROM public.daily_chat_usage
  WHERE user_id = p_user_id AND date = p_date;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- Function to increment daily chat usage
CREATE OR REPLACE FUNCTION public.increment_chat_usage(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.daily_chat_usage (user_id, date, count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET count = public.daily_chat_usage.count + 1, updated_at = now()
  RETURNING public.daily_chat_usage.count INTO v_count;
  
  RETURN v_count;
END;
$$;

-- Function to get file upload count for a user
CREATE OR REPLACE FUNCTION public.get_upload_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.file_uploads
  WHERE user_id = p_user_id;
  
  RETURN v_count;
END;
$$;
