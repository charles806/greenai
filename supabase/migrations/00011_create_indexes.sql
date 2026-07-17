-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Payment attempts
CREATE INDEX IF NOT EXISTS idx_payment_attempts_user_id ON public.payment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_reference ON public.payment_attempts(reference);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_status ON public.payment_attempts(status);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency ON public.webhook_events(idempotency_key);

-- Usage logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON public.usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);

-- Daily chat usage
CREATE INDEX IF NOT EXISTS idx_daily_chat_usage_user_id ON public.daily_chat_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_chat_usage_date ON public.daily_chat_usage(date);
CREATE INDEX IF NOT EXISTS idx_daily_chat_usage_user_date ON public.daily_chat_usage(user_id, date);

-- File uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON public.file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_file_type ON public.file_uploads(file_type);
