-- BOM templates: định mức vật tư cho 1 ha theo cây trồng
CREATE TABLE public.bom_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_key TEXT NOT NULL,
  crop_label TEXT NOT NULL,
  area_basis_ha NUMERIC NOT NULL DEFAULT 1,
  notes TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crop_key)
);

ALTER TABLE public.bom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "BOM templates publicly readable"
  ON public.bom_templates FOR SELECT TO public USING (active = true);

CREATE POLICY "Admins manage BOM templates"
  ON public.bom_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_bom_templates_updated_at
  BEFORE UPDATE ON public.bom_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Market prices: lưu giá nông sản theo ngày + tỉnh
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_key TEXT NOT NULL,
  crop_label TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'all',
  price_vnd NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crop_key, province, recorded_at)
);

CREATE INDEX idx_market_prices_lookup ON public.market_prices (crop_key, province, recorded_at DESC);

ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market prices publicly readable"
  ON public.market_prices FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage market prices"
  ON public.market_prices FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role inserts market prices"
  ON public.market_prices FOR INSERT TO public WITH CHECK (true);

-- Seed BOM templates cho 5 cây phổ biến (định mức /1 ha)
INSERT INTO public.bom_templates (crop_key, crop_label, area_basis_ha, items, notes) VALUES
('sau_rieng', 'Sầu riêng', 1, '[
  {"category":"Béc tưới","name":"Béc phun cánh đập 360°","qty":250,"unit":"cái","price":35000},
  {"category":"Ống chính","name":"Ống PE PN10 Ø50mm","qty":120,"unit":"m","price":42000},
  {"category":"Ống nhánh","name":"Ống PE Ø25mm","qty":900,"unit":"m","price":12000},
  {"category":"Phụ kiện","name":"Bộ co T, khớp nối Ø25-50","qty":180,"unit":"bộ","price":8500},
  {"category":"Van điều áp","name":"Van 1 chiều + lọc đĩa Ø50","qty":2,"unit":"bộ","price":850000},
  {"category":"Máy bơm","name":"Bơm ly tâm trục đứng 3HP","qty":1,"unit":"chiếc","price":8500000}
]'::jsonb, 'Định mức cho mật độ 250 cây/ha, độ dốc nhẹ'),
('ca_phe', 'Cà phê', 1, '[
  {"category":"Béc tưới","name":"Béc tia gốc 180°","qty":1100,"unit":"cái","price":12000},
  {"category":"Ống chính","name":"Ống PE PN8 Ø42mm","qty":140,"unit":"m","price":36000},
  {"category":"Ống nhánh","name":"Ống PE Ø20mm","qty":1500,"unit":"m","price":9500},
  {"category":"Phụ kiện","name":"Khớp nối, co T Ø20-42","qty":260,"unit":"bộ","price":7000},
  {"category":"Bộ lọc","name":"Lọc đĩa 130 mesh Ø42","qty":1,"unit":"bộ","price":1200000},
  {"category":"Máy bơm","name":"Bơm ly tâm 2HP","qty":1,"unit":"chiếc","price":5500000}
]'::jsonb, 'Mật độ 1100 cây/ha, tưới gốc nhỏ giọt'),
('tieu', 'Hồ tiêu', 1, '[
  {"category":"Ống nhỏ giọt","name":"Dây nhỏ giọt 16mm 30cm","qty":2200,"unit":"m","price":7500},
  {"category":"Ống chính","name":"Ống PE Ø32mm","qty":110,"unit":"m","price":22000},
  {"category":"Phụ kiện","name":"Đầu chia, đầu bịt","qty":300,"unit":"bộ","price":5500},
  {"category":"Bộ lọc","name":"Lọc lưới 120 mesh","qty":1,"unit":"bộ","price":850000},
  {"category":"Máy bơm","name":"Bơm 2HP áp cao","qty":1,"unit":"chiếc","price":6200000}
]'::jsonb, 'Mật độ 2200 trụ/ha'),
('bo', 'Bơ', 1, '[
  {"category":"Béc tưới","name":"Béc cánh đập 360° gốc","qty":280,"unit":"cái","price":32000},
  {"category":"Ống chính","name":"Ống PE Ø50mm PN10","qty":130,"unit":"m","price":42000},
  {"category":"Ống nhánh","name":"Ống PE Ø25mm","qty":850,"unit":"m","price":12000},
  {"category":"Phụ kiện","name":"Bộ co T, khớp nối","qty":170,"unit":"bộ","price":8500},
  {"category":"Van + lọc","name":"Van 1 chiều + lọc đĩa","qty":2,"unit":"bộ","price":850000},
  {"category":"Máy bơm","name":"Bơm 3HP","qty":1,"unit":"chiếc","price":8500000}
]'::jsonb, 'Mật độ 280 cây/ha'),
('chanh_day', 'Chanh dây', 1, '[
  {"category":"Ống nhỏ giọt","name":"Ống nhỏ giọt 16mm 20cm","qty":1800,"unit":"m","price":7800},
  {"category":"Ống chính","name":"Ống PE Ø32mm","qty":120,"unit":"m","price":22000},
  {"category":"Phụ kiện","name":"Đầu chia, khớp nối","qty":280,"unit":"bộ","price":5500},
  {"category":"Bộ lọc","name":"Lọc đĩa 120 mesh","qty":1,"unit":"bộ","price":900000},
  {"category":"Châm phân","name":"Bộ châm phân Venturi","qty":1,"unit":"bộ","price":1500000},
  {"category":"Máy bơm","name":"Bơm 2HP","qty":1,"unit":"chiếc","price":5500000}
]'::jsonb, 'Mật độ 1800 trụ/ha, có châm phân tự động');

-- Seed market_prices: 14 ngày cho sầu riêng Đắk Lắk + cà phê + hồ tiêu (giả lập trend)
INSERT INTO public.market_prices (crop_key, crop_label, province, price_vnd, unit, recorded_at, source) VALUES
('sau_rieng', 'Sầu riêng Ri6', 'Đắk Lắk', 78000, 'kg', CURRENT_DATE - 13, 'seed'),
('sau_rieng', 'Sầu riêng Ri6', 'Đắk Lắk', 80000, 'kg', CURRENT_DATE - 11, 'seed'),
('sau_rieng', 'Sầu riêng Ri6', 'Đắk Lắk', 82000, 'kg', CURRENT_DATE - 9, 'seed'),
('sau_rieng', 'Sầu riêng Ri6', 'Đắk Lắk', 85000, 'kg', CURRENT_DATE - 7, 'seed'),
('sau_rieng', 'Sầu riêng Ri6', 'Đắk Lắk', 88000, 'kg', CURRENT_DATE - 5, 'seed'),
('sau_rieng', 'Sầu riêng Ri6', 'Đắk Lắk', 92000, 'kg', CURRENT_DATE - 3, 'seed'),
('sau_rieng', 'Sầu riêng Ri6', 'Đắk Lắk', 96000, 'kg', CURRENT_DATE - 1, 'seed'),
('ca_phe', 'Cà phê Robusta', 'Đắk Lắk', 105000, 'kg', CURRENT_DATE - 7, 'seed'),
('ca_phe', 'Cà phê Robusta', 'Đắk Lắk', 110000, 'kg', CURRENT_DATE - 1, 'seed'),
('tieu', 'Hồ tiêu', 'Đắk Lắk', 145000, 'kg', CURRENT_DATE - 7, 'seed'),
('tieu', 'Hồ tiêu', 'Đắk Lắk', 152000, 'kg', CURRENT_DATE - 1, 'seed');