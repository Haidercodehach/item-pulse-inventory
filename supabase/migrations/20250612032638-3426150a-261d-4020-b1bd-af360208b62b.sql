
-- Create sales table to track individual sales transactions
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sale items table to track items in each sale
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings table for customization
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.app_settings (setting_key, setting_value, category, description) VALUES
('company_info', '{"name": "Your Company", "address": "123 Business St", "phone": "+1-555-0123", "email": "info@company.com", "website": "www.company.com", "logo_url": ""}', 'company', 'Company information for invoices'),
('invoice_settings', '{"prefix": "INV", "start_number": 1001, "tax_rate": 0.0875, "currency": "USD", "due_days": 30}', 'invoice', 'Invoice generation settings'),
('pos_settings', '{"auto_print": false, "default_payment_method": "cash", "receipt_footer": "Thank you for your business!"}', 'pos', 'Point of sale settings'),
('theme_settings', '{"primary_color": "#3b82f6", "secondary_color": "#64748b", "accent_color": "#f59e0b", "dark_mode": false}', 'appearance', 'Theme and appearance settings'),
('notification_settings', '{"low_stock_alerts": true, "sale_notifications": true, "email_notifications": false}', 'notifications', 'Notification preferences');

-- Enable RLS on new tables
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for sales
CREATE POLICY "Users can view all sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Users can create sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their sales" ON public.sales FOR UPDATE USING (auth.uid() = created_by);

-- RLS policies for sale_items
CREATE POLICY "Users can view all sale items" ON public.sale_items FOR SELECT USING (true);
CREATE POLICY "Users can create sale items" ON public.sale_items FOR INSERT WITH CHECK (true);

-- RLS policies for app_settings
CREATE POLICY "Users can view all settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can modify settings" ON public.app_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'manager')
  )
);

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefix TEXT;
  start_num INTEGER;
  next_num INTEGER;
  invoice_settings JSONB;
BEGIN
  -- Get invoice settings
  SELECT setting_value INTO invoice_settings
  FROM public.app_settings
  WHERE setting_key = 'invoice_settings';
  
  prefix := COALESCE(invoice_settings->>'prefix', 'INV');
  start_num := COALESCE((invoice_settings->>'start_number')::INTEGER, 1001);
  
  -- Get the next number based on existing invoices
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM LENGTH(prefix) + 1) AS INTEGER)), start_num - 1) + 1
  INTO next_num
  FROM public.sales
  WHERE invoice_number ~ ('^' || prefix || '[0-9]+$');
  
  RETURN prefix || next_num::TEXT;
END;
$$;

-- Create function to process sale and update inventory
CREATE OR REPLACE FUNCTION process_sale(
  sale_data JSONB,
  sale_items_data JSONB[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sale_id UUID;
  item_data JSONB;
  item_record RECORD;
BEGIN
  -- Create the sale
  INSERT INTO public.sales (
    invoice_number,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    subtotal,
    tax_rate,
    tax_amount,
    discount_amount,
    total_amount,
    payment_method,
    payment_status,
    notes,
    created_by
  ) VALUES (
    generate_invoice_number(),
    sale_data->>'customer_name',
    sale_data->>'customer_email',
    sale_data->>'customer_phone',
    sale_data->>'customer_address',
    (sale_data->>'subtotal')::DECIMAL,
    (sale_data->>'tax_rate')::DECIMAL,
    (sale_data->>'tax_amount')::DECIMAL,
    (sale_data->>'discount_amount')::DECIMAL,
    (sale_data->>'total_amount')::DECIMAL,
    sale_data->>'payment_method',
    sale_data->>'payment_status',
    sale_data->>'notes',
    auth.uid()
  ) RETURNING id INTO sale_id;
  
  -- Process each sale item
  FOREACH item_data IN ARRAY sale_items_data
  LOOP
    -- Insert sale item
    INSERT INTO public.sale_items (
      sale_id,
      item_id,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      sale_id,
      (item_data->>'item_id')::UUID,
      (item_data->>'quantity')::INTEGER,
      (item_data->>'unit_price')::DECIMAL,
      (item_data->>'total_price')::DECIMAL
    );
    
    -- Update inventory quantity using existing function
    PERFORM update_inventory_quantity(
      (item_data->>'item_id')::UUID,
      -((item_data->>'quantity')::INTEGER), -- Negative for sale
      'sale'::transaction_type,
      (item_data->>'unit_price')::DECIMAL,
      'SALE-' || sale_id::TEXT,
      'Sale transaction'
    );
  END LOOP;
  
  RETURN sale_id;
END;
$$;
