-- Migration: Add O2O routing fields to calculator_leads
-- Date: 2026-05-06
-- Purpose: Enable automatic lead routing by province/district matching

-- Step 1: Add new columns if they don't exist
ALTER TABLE public.calculator_leads
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS assigned_dealer_id UUID REFERENCES public.dealers(id),
ADD COLUMN IF NOT EXISTS calculator_data JSONB DEFAULT '{}'::jsonb;

-- Step 2: Rename columns to match Prisma convention (if old names exist)
ALTER TABLE public.calculator_leads
ALTER COLUMN customer_province RENAME TO province,
ALTER COLUMN crop RENAME TO crop_type;

-- Step 3: Add index on province for faster routing lookups
CREATE INDEX IF NOT EXISTS idx_calculator_leads_province ON public.calculator_leads(province);
CREATE INDEX IF NOT EXISTS idx_calculator_leads_district ON public.calculator_leads(district);
CREATE INDEX IF NOT EXISTS idx_calculator_leads_assigned_dealer ON public.calculator_leads(assigned_dealer_id);

-- Step 4: Create RLS policy for dealers to see their own leads
-- Dealers can only see leads assigned to them
CREATE POLICY "Dealers can view their assigned leads"
ON public.calculator_leads FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'dealer')
  AND assigned_dealer_id IN (
    SELECT d.id FROM public.dealers d
    JOIN public.profiles p ON p.dealer_id = d.id
    WHERE p.id = auth.uid()
  )
);

-- Step 5: Insert UTM data if provided (via trigger or application logic)
-- Note: utm_source, utm_medium, utm_campaign columns should already exist from previous migrations

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.calculator_leads.assigned_dealer_id IS 'Dealer ID assigned via O2O routing engine';
COMMENT ON COLUMN public.calculator_leads.calculator_data IS 'Full BOM breakdown: { lines: [...], totalCost: number }';
COMMENT ON COLUMN public.calculator_leads.status IS 'Lead status: new, assigned, contacted, won, lost';
