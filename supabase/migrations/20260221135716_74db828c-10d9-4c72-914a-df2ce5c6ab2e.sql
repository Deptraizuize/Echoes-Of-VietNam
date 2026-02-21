
-- Revenue records table for tracking all income sources
CREATE TABLE public.revenue_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL DEFAULT 'premium', -- 'premium', 'ads', 'collab', 'other'
  source_label TEXT NOT NULL, -- e.g. "Gói 1 Tháng", "Google Ads T1/2026", "Đối tác ABC"
  amount INTEGER NOT NULL DEFAULT 0, -- in VND
  note TEXT,
  reference_id UUID, -- optional link to premium_requests.id
  recorded_by UUID, -- admin user_id
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage revenue" ON public.revenue_records
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_revenue_records_updated_at
  BEFORE UPDATE ON public.revenue_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
