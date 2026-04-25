-- Enable scheduling extensions for nightly BI export
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Seed default app_settings rows so the Integrations UI has data on first load
INSERT INTO public.app_settings (key, value, description) VALUES
  ('bi_export_config', '{"enabled":false,"lookback_hours":24,"bq_dataset":"agriflow","bi_export_webhook_url":""}'::jsonb,
   'Cấu hình export BI sang BigQuery qua n8n'),
  ('ga4_config', '{"measurement_id":"","api_secret":""}'::jsonb,
   'Cấu hình Google Analytics 4 server-side'),
  ('maps_status', '{"configured":false}'::jsonb,
   'Trạng thái Google Maps API key (chỉ đọc)')
ON CONFLICT (key) DO NOTHING;

-- Update tracking_enabled to include ga4 flag if missing
UPDATE public.app_settings
SET value = COALESCE(value, '{}'::jsonb) || '{"ga4":true}'::jsonb
WHERE key = 'tracking_enabled' AND NOT (value ? 'ga4');

-- Insert default tracking_enabled if not exists
INSERT INTO public.app_settings (key, value, description) VALUES
  ('tracking_enabled', '{"facebook":true,"tiktok":true,"internal":true,"ga4":true}'::jsonb,
   'Bật/tắt từng kênh tracking server-side')
ON CONFLICT (key) DO NOTHING;