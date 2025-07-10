-- Add date tracking fields to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN purchase_date DATE,
ADD COLUMN sale_date DATE;

-- Add a trigger to automatically set sale_date when status changes to 'sold'
CREATE OR REPLACE FUNCTION public.update_sale_date()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is being changed to 'sold' and sale_date is not already set
  IF NEW.status = 'sold' AND OLD.status != 'sold' AND NEW.sale_date IS NULL THEN
    NEW.sale_date = CURRENT_DATE;
  END IF;
  
  -- If status is being changed from 'sold' to 'available', clear sale_date
  IF NEW.status = 'available' AND OLD.status = 'sold' THEN
    NEW.sale_date = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic sale date updates
CREATE TRIGGER update_inventory_sale_date
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sale_date();