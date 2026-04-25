-- ============ Product Specialty Groups (admin-defined) ============
CREATE TABLE public.product_specialty_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.product_specialty_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Specialty groups publicly readable"
  ON public.product_specialty_groups FOR SELECT
  USING (active = true);

CREATE POLICY "Admins manage specialty groups"
  ON public.product_specialty_groups FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_specialty_groups_updated_at
  BEFORE UPDATE ON public.product_specialty_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Products (PIM master) ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  specialty_group_key text REFERENCES public.product_specialty_groups(key) ON DELETE SET NULL,
  description text,
  base_price numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'cái',
  image text,
  stock int NOT NULL DEFAULT 0,
  -- Dynamic Attributes: array of { group, key, label, value, unit }
  attributes jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Media Hub: { videos: [{title, url}], pdfs: [{title, url}], images: [url] }
  media jsonb NOT NULL DEFAULT '{"videos":[],"pdfs":[],"images":[]}'::jsonb,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_specialty ON public.products(specialty_group_key);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products publicly readable"
  ON public.products FOR SELECT
  USING (active = true);

CREATE POLICY "Admins read all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default specialty groups (admin can edit/add later)
INSERT INTO public.product_specialty_groups (key, label, description, icon, sort_order) VALUES
  ('irrigation', 'Hệ thống tưới', 'Béc phun, nhỏ giọt, ống tưới', '💧', 1),
  ('pump', 'Máy bơm', 'Bơm ly tâm, bơm chìm, bơm tăng áp', '⚙️', 2),
  ('iot_sensor', 'Cảm biến & IoT', 'Cảm biến đất, độ ẩm, điều khiển từ xa', '📡', 3),
  ('drone', 'Drone nông nghiệp', 'Máy bay phun, khảo sát', '🚁', 4),
  ('pipe_fitting', 'Ống & phụ kiện', 'Ống PE, HDPE, co nối, van', '🔧', 5);