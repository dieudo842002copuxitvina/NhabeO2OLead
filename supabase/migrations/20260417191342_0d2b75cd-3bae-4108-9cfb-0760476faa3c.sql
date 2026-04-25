-- 1. Tagging đa biến cho products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS crop_tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS terrain_tags text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE INDEX IF NOT EXISTS idx_products_crop_tags ON public.products USING GIN(crop_tags);
CREATE INDEX IF NOT EXISTS idx_products_terrain_tags ON public.products USING GIN(terrain_tags);

-- 2. CMS Articles
CREATE TABLE IF NOT EXISTS public.cms_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  cover_image text,
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'guide',
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  crop_tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  terrain_tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  related_product_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  status text NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  author_id uuid,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cms_articles_status_check CHECK (status IN ('draft','published','archived'))
);

CREATE INDEX IF NOT EXISTS idx_cms_articles_status ON public.cms_articles(status);
CREATE INDEX IF NOT EXISTS idx_cms_articles_published_at ON public.cms_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_cms_articles_crop_tags ON public.cms_articles USING GIN(crop_tags);
CREATE INDEX IF NOT EXISTS idx_cms_articles_related_products ON public.cms_articles USING GIN(related_product_ids);

ALTER TABLE public.cms_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles publicly readable"
  ON public.cms_articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins read all articles"
  ON public.cms_articles FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert articles"
  ON public.cms_articles FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update articles"
  ON public.cms_articles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete articles"
  ON public.cms_articles FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_cms_articles_updated_at
  BEFORE UPDATE ON public.cms_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. CMS Case Studies
CREATE TABLE IF NOT EXISTS public.cms_case_studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  customer_name text,
  province text,
  district text,
  crop text,
  area_ha numeric,
  summary text,
  body text NOT NULL DEFAULT '',
  cover_image text,
  gallery text[] NOT NULL DEFAULT ARRAY[]::text[],
  related_product_ids uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  dealer_name text,
  installer_name text,
  status text NOT NULL DEFAULT 'draft',
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cms_case_studies_status_check CHECK (status IN ('draft','published','archived'))
);

CREATE INDEX IF NOT EXISTS idx_cms_case_studies_status ON public.cms_case_studies(status);
CREATE INDEX IF NOT EXISTS idx_cms_case_studies_featured ON public.cms_case_studies(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_cms_case_studies_published_at ON public.cms_case_studies(published_at DESC);

ALTER TABLE public.cms_case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published case studies publicly readable"
  ON public.cms_case_studies FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins read all case studies"
  ON public.cms_case_studies FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins insert case studies"
  ON public.cms_case_studies FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update case studies"
  ON public.cms_case_studies FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete case studies"
  ON public.cms_case_studies FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_cms_case_studies_updated_at
  BEFORE UPDATE ON public.cms_case_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Storage buckets
INSERT INTO storage.buckets (id, name, public)
  VALUES ('cms-media','cms-media', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('product-docs','product-docs', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies — cms-media
CREATE POLICY "cms-media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cms-media');

CREATE POLICY "cms-media admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cms-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "cms-media admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cms-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "cms-media admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cms-media' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies — product-docs
CREATE POLICY "product-docs public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-docs');

CREATE POLICY "product-docs admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-docs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "product-docs admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-docs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "product-docs admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-docs' AND has_role(auth.uid(), 'admin'::app_role));