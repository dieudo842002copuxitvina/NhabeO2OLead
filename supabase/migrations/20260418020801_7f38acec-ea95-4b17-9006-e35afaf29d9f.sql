-- ai_rules table for admin-managed banner/popup triggers
CREATE TABLE public.ai_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL CHECK (rule_type IN ('weather','price')),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  banner jsonb NOT NULL DEFAULT '{}'::jsonb,
  region text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active AI rules publicly readable"
  ON public.ai_rules FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins read all AI rules"
  ON public.ai_rules FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "Admins manage AI rules"
  ON public.ai_rules FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER update_ai_rules_updated_at
  BEFORE UPDATE ON public.ai_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ai_rules_type_status ON public.ai_rules(rule_type, status);

-- Seed defaults
INSERT INTO public.ai_rules (rule_type, name, status, config, banner, region) VALUES
('weather','Hạn hán Tây Nguyên','active',
  '{"rainfallMmMax":5,"consecutiveDays":10}'::jsonb,
  '{"title":"Giải pháp tưới chống hạn cho vườn Tây Nguyên","cta":"Xem giải pháp chống hạn","ctaTo":"/giai-phap"}'::jsonb,
  'Tây Nguyên'),
('price','Cà phê tăng giá > 20%/tuần','active',
  '{"commodity":"Cà phê","changePctMin":20,"windowDays":7}'::jsonb,
  '{"title":"Nâng cấp hệ thống tưới tự động","body":"Giá cà phê đang tăng mạnh — đây là thời điểm vàng để đầu tư hệ thống tưới tự động, tăng năng suất 30%.","cta":"Xem gói nâng cấp","ctaTo":"/products?category=Hệ thống tưới"}'::jsonb,
  'Tây Nguyên');