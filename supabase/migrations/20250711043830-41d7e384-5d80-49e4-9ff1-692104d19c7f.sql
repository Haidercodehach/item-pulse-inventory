
-- Drop the existing trigger first
DROP TRIGGER IF EXISTS update_sale_date_trigger ON public.inventory_items;

-- Update the trigger function to also create a sale record
CREATE OR REPLACE FUNCTION public.update_sale_date_and_create_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sale_id UUID;
BEGIN
  -- If status is being changed to 'sold' and sale_date is not already set
  IF NEW.status = 'sold' AND OLD.status != 'sold' AND NEW.sale_date IS NULL THEN
    NEW.sale_date = CURRENT_DATE;
    
    -- Create a sale record for this individual item
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
      COALESCE(NEW.seller, 'Direct Sale'),
      NULL,
      NULL,
      NULL,
      COALESCE(NEW.price, 0),
      0,
      0,
      0,
      COALESCE(NEW.price, 0),
      'manual',
      'paid',
      'Manual status change to sold',
      auth.uid()
    ) RETURNING id INTO sale_id;
    
    -- Create a sale item record
    INSERT INTO public.sale_items (
      sale_id,
      item_id,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      sale_id,
      NEW.id,
      1,
      COALESCE(NEW.price, 0),
      COALESCE(NEW.price, 0)
    );
    
    -- Create an inventory transaction
    INSERT INTO public.inventory_transactions (
      item_id,
      transaction_type,
      quantity,
      previous_quantity,
      new_quantity,
      unit_cost,
      total_cost,
      reference_number,
      notes,
      created_by
    ) VALUES (
      NEW.id,
      'sale'::transaction_type,
      -1,
      COALESCE(OLD.quantity, 0),
      COALESCE(OLD.quantity, 0) - 1,
      COALESCE(NEW.price, 0),
      COALESCE(NEW.price, 0),
      'MANUAL-' || sale_id::TEXT,
      'Manual status change to sold',
      auth.uid()
    );
    
    -- Update the quantity in inventory
    NEW.quantity = COALESCE(OLD.quantity, 0) - 1;
  END IF;
  
  -- If status is being changed from 'sold' to 'available', clear sale_date
  IF NEW.status = 'available' AND OLD.status = 'sold' THEN
    NEW.sale_date = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the new trigger
CREATE TRIGGER update_sale_date_and_create_sale_trigger
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sale_date_and_create_sale();
