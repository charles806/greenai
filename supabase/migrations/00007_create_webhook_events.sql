CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  paystack_signature TEXT NOT NULL,
  raw_body JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  idempotency_key TEXT UNIQUE,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service_role can access webhook_events (no public access)
CREATE POLICY "Service role only"
  ON public.webhook_events
  USING (false);
