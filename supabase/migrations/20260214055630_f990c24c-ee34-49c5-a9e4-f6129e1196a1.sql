
-- Payment settings table for admin to manage QR codes, bank info, etc.
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active settings (needed for upgrade page)
CREATE POLICY "Anyone can view active payment settings"
ON public.payment_settings FOR SELECT
USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins manage payment settings"
ON public.payment_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
BEFORE UPDATE ON public.payment_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Seed default payment settings
INSERT INTO public.payment_settings (setting_key, setting_value, description) VALUES
('bank_name', 'Vietcombank', 'Tên ngân hàng'),
('bank_account', '1234567890', 'Số tài khoản'),
('bank_owner', 'NGUYEN VAN A', 'Chủ tài khoản'),
('qr_image_url', '', 'URL ảnh mã QR thanh toán'),
('transfer_content', 'NANGCAP [USERNAME]', 'Nội dung chuyển khoản'),
('price_display', '19.000đ/tháng', 'Giá hiển thị');
