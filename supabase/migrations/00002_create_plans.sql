CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  monthly_price INTEGER NOT NULL DEFAULT 0,
  yearly_price INTEGER NOT NULL DEFAULT 0,
  model_name TEXT NOT NULL,
  upload_limit INTEGER NOT NULL DEFAULT 0,
  daily_chat_limit INTEGER NOT NULL DEFAULT 0,
  max_file_size INTEGER NOT NULL DEFAULT 10485760,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active plans"
  ON public.plans FOR SELECT
  USING (active = true);
