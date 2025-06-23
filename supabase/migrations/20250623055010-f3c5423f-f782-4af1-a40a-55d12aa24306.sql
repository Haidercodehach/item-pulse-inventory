
-- Update the tax rate setting to 22% (0.22) in the app_settings table
UPDATE public.app_settings 
SET setting_value = jsonb_set(
  setting_value, 
  '{tax_rate}', 
  '0.22'
)
WHERE setting_key = 'invoice_settings';

-- If the invoice_settings don't exist yet, create them with 22% tax rate
INSERT INTO public.app_settings (setting_key, setting_value, category, description)
SELECT 
  'invoice_settings',
  '{"tax_rate": 0.22, "prefix": "INV", "start_number": 1001}'::jsonb,
  'invoice',
  'Invoice configuration settings including tax rate, number prefix and starting number'
WHERE NOT EXISTS (
  SELECT 1 FROM public.app_settings WHERE setting_key = 'invoice_settings'
);
