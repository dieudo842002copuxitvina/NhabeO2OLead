"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ParamMap } from '@/lib/calculatorV2';

export interface CalculatorParamRow {
  id: string;
  key: string;
  label: string;
  value: number;
  unit: string | null;
  category: 'price' | 'factor' | 'crop' | 'misc';
  description: string | null;
}

/**
 * Loads all calculator params and exposes a flat map { key: value }.
 * Public read — works for anonymous visitors thanks to RLS SELECT policy.
 */
export function useCalculatorParams() {
  const [rows, setRows] = useState<CalculatorParamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('calculator_params')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setRows((data ?? []).map(r => ({ ...r, value: Number(r.value) })) as CalculatorParamRow[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const params: ParamMap = Object.fromEntries(rows.map(r => [r.key, Number(r.value)]));

  return { rows, params, loading, error, reload: load };
}
