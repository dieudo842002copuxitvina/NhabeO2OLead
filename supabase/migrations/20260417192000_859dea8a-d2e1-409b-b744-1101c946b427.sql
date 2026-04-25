CREATE TABLE IF NOT EXISTS public.crop_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.terrain_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terrain_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crop tags publicly readable" ON public.crop_tags FOR SELECT USING (active = true);
CREATE POLICY "Admins manage crop tags" ON public.crop_tags FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Terrain tags publicly readable" ON public.terrain_tags FOR SELECT USING (active = true);
CREATE POLICY "Admins manage terrain tags" ON public.terrain_tags FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_crop_tags_updated_at BEFORE UPDATE ON public.crop_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_terrain_tags_updated_at BEFORE UPDATE ON public.terrain_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.crop_tags (key, label, icon, sort_order) VALUES
  ('sau-rieng','Sầu riêng','🥥',1),
  ('ca-phe','Cà phê','☕',2),
  ('ho-tieu','Hồ tiêu','🌶️',3),
  ('lua','Lúa','🌾',4),
  ('rau-mau','Rau màu','🥬',5),
  ('cay-an-trai','Cây ăn trái','🍊',6)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.terrain_tags (key, label, icon, sort_order) VALUES
  ('dat-doc','Đất dốc','⛰️',1),
  ('dat-bang','Đất bằng','🟫',2),
  ('ruong-bac-thang','Ruộng bậc thang','🪜',3),
  ('doi-nui','Đồi núi','🏔️',4)
ON CONFLICT (key) DO NOTHING;