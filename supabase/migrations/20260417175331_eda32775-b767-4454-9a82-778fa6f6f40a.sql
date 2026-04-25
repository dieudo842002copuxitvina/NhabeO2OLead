-- tracking_events
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_id text NOT NULL,
  user_id uuid,
  session_id text,
  url text,
  referrer text,
  user_agent text,
  ip_address text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  fb_status text,
  tiktok_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_name ON public.tracking_events(event_name);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created ON public.tracking_events(created_at DESC);

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert tracking events"
  ON public.tracking_events FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins and BI viewers can read tracking"
  ON public.tracking_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'bi_viewer'));

-- app_settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage app settings"
  ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read settings"
  ON public.app_settings FOR SELECT TO authenticated USING (true);

CREATE TRIGGER trg_app_settings_updated
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_settings (key, value, description) VALUES
  ('n8n_webhook_url', '{"url":""}'::jsonb, 'URL webhook n8n nhận lead mới'),
  ('tracking_enabled', '{"facebook":true,"tiktok":true,"internal":true}'::jsonb, 'Bật/tắt từng kênh tracking')
ON CONFLICT (key) DO NOTHING;