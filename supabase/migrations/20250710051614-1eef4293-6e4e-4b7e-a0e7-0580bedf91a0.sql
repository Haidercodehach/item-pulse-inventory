-- Add seller field to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN seller TEXT;