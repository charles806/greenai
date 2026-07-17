-- Seed the default plans
INSERT INTO public.plans (slug, display_name, monthly_price, yearly_price, model_name, upload_limit, daily_chat_limit, max_file_size)
VALUES
  ('free', 'Free', 0, 0, 'GX 1.5', 2, 100, 10485760),
  ('pro', 'Pro', 250000, 2400000, 'GX 2.0', 20, -1, 10485760),
  ('max', 'MAX', 500000, 4500000, 'GX 3.0', -1, -1, 10485760)
ON CONFLICT (slug) DO NOTHING;
