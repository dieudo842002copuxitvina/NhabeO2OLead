-- ============ calculator_params: tunable pricing & coefficients ============
CREATE TABLE public.calculator_params (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  category TEXT NOT NULL CHECK (category IN ('price', 'factor', 'crop', 'misc')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_params ENABLE ROW LEVEL SECURITY;

-- Public read (calculator runs for anonymous visitors)
CREATE POLICY "Calculator params are public readable"
ON public.calculator_params FOR SELECT
USING (true);

-- Only admins can mutate
CREATE POLICY "Admins can insert calculator params"
ON public.calculator_params FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update calculator params"
ON public.calculator_params FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete calculator params"
ON public.calculator_params FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_calculator_params_updated_at
BEFORE UPDATE ON public.calculator_params
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_calculator_params_category ON public.calculator_params(category);

-- ============ calculator_leads: every Zalo CTA click ============
CREATE TABLE public.calculator_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,                 -- nullable: visitors don't need to be logged in
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_province TEXT,
  crop TEXT NOT NULL,
  area_m2 NUMERIC NOT NULL,
  spacing TEXT NOT NULL,
  slope TEXT NOT NULL,
  water_source TEXT NOT NULL,
  nozzle_count INTEGER NOT NULL,
  pipe_meters INTEGER NOT NULL,
  pump_hp NUMERIC NOT NULL,
  total_cost NUMERIC NOT NULL,
  dealer_id TEXT,               -- nearest dealer id (mock for now)
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calculator_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (incl. anonymous) can submit a lead
CREATE POLICY "Anyone can create calculator leads"
ON public.calculator_leads FOR INSERT
WITH CHECK (true);

-- Owner sees own leads (when logged in)
CREATE POLICY "Users can view their own leads"
ON public.calculator_leads FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admin sees everything
CREATE POLICY "Admins can view all calculator leads"
ON public.calculator_leads FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update calculator leads"
ON public.calculator_leads FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete calculator leads"
ON public.calculator_leads FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_calculator_leads_created ON public.calculator_leads(created_at DESC);
CREATE INDEX idx_calculator_leads_status ON public.calculator_leads(status);

-- ============ Seed default parameters ============
INSERT INTO public.calculator_params (key, label, value, unit, category, description) VALUES
  -- Material prices
  ('price_nozzle', 'Giá béc tưới (mỗi cái)', 35000, 'VNĐ', 'price', 'Béc phun bù áp tiêu chuẩn'),
  ('price_pipe_main', 'Giá ống chính PE Ø32 (mỗi mét)', 18000, 'VNĐ/m', 'price', 'Ống PE chịu lực dùng làm ống chính'),
  ('price_pipe_branch', 'Giá ống nhánh Ø16 (mỗi mét)', 6500, 'VNĐ/m', 'price', 'Ống nhánh dẫn nước đến từng cây'),
  ('price_pump_per_hp', 'Giá máy bơm (mỗi HP)', 2200000, 'VNĐ/HP', 'price', 'Giá tham chiếu máy bơm theo công suất'),
  ('price_filter', 'Giá bộ lọc + van', 850000, 'VNĐ', 'price', 'Bộ lọc đĩa + van điện tiêu chuẩn'),
  ('price_install_per_m2', 'Phí thi công lắp đặt (mỗi m²)', 4500, 'VNĐ/m²', 'price', 'Tiền công lắp đặt trung bình'),

  -- Coefficients
  ('factor_loss', 'Hệ số hao hụt vật tư', 1.08, '×', 'factor', 'Nhân thêm 8% cho cắt thừa, dự phòng'),
  ('factor_slope_flat', 'Hệ số địa hình phẳng', 1.0, '×', 'factor', 'Đất bằng phẳng, không cộng thêm'),
  ('factor_slope_hilly', 'Hệ số địa hình dốc', 1.15, '×', 'factor', 'Đất dốc cần thêm ống và bơm khoẻ hơn'),
  ('factor_water_well', 'Hệ số nguồn giếng khoan', 1.10, '×', 'factor', 'Cần thêm ống hút sâu + bơm chìm'),
  ('factor_water_river', 'Hệ số nguồn hồ/sông', 1.0, '×', 'factor', 'Bơm mặt tiêu chuẩn'),
  ('pump_hp_per_1000m2', 'Công suất bơm cần / 1000m²', 0.6, 'HP', 'factor', 'Quy tắc kinh nghiệm: 0.6 HP cho mỗi 1000m²'),

  -- Crop-specific (nozzles per tree, default spacing)
  ('crop_durian_nozzles', 'Sầu riêng — béc/cây', 2, 'béc', 'crop', '2 béc/cây cho tán rộng'),
  ('crop_durian_spacing', 'Sầu riêng — khoảng cách (m)', 8, 'm', 'crop', 'Trồng 8x8m chuẩn'),
  ('crop_coffee_nozzles', 'Cà phê — béc/cây', 1, 'béc', 'crop', '1 béc/cây cà phê'),
  ('crop_coffee_spacing', 'Cà phê — khoảng cách (m)', 3, 'm', 'crop', 'Trồng 3x3m chuẩn'),
  ('crop_pomelo_nozzles', 'Bưởi — béc/cây', 2, 'béc', 'crop', '2 béc/cây bưởi'),
  ('crop_pomelo_spacing', 'Bưởi — khoảng cách (m)', 6, 'm', 'crop', 'Trồng 6x6m chuẩn'),
  ('crop_pepper_nozzles', 'Hồ tiêu — béc/cây', 1, 'béc', 'crop', '1 béc/trụ'),
  ('crop_pepper_spacing', 'Hồ tiêu — khoảng cách (m)', 2.5, 'm', 'crop', 'Trồng 2.5x2.5m'),
  ('crop_dragonfruit_nozzles', 'Thanh long — béc/cây', 1, 'béc', 'crop', '1 béc/trụ thanh long'),
  ('crop_dragonfruit_spacing', 'Thanh long — khoảng cách (m)', 3, 'm', 'crop', 'Trồng 3x3m'),
  ('crop_avocado_nozzles', 'Bơ — béc/cây', 2, 'béc', 'crop', '2 béc/cây bơ'),
  ('crop_avocado_spacing', 'Bơ — khoảng cách (m)', 6, 'm', 'crop', 'Trồng 6x6m');
