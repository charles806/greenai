CREATE TABLE IF NOT EXISTS public.daily_chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_chat_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily usage"
  ON public.daily_chat_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily usage"
  ON public.daily_chat_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily usage"
  ON public.daily_chat_usage FOR UPDATE
  USING (auth.uid() = user_id);
