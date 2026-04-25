ALTER TABLE public.calculator_leads
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS status_history jsonb NOT NULL DEFAULT '[]'::jsonb;