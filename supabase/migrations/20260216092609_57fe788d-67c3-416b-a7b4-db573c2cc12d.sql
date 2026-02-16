
-- Add plan_type and proof_image_url to premium_requests
ALTER TABLE public.premium_requests 
  ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS proof_image_url text;

-- Create storage bucket for payment proof images
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: authenticated users can upload their own proof images
CREATE POLICY "Users upload own proof images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS: anyone can view proof images (admin needs to see them)
CREATE POLICY "Anyone can view proof images"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

-- RLS: users can delete their own proof images
CREATE POLICY "Users delete own proof images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);
