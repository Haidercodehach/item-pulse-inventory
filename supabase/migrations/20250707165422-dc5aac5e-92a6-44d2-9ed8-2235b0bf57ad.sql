-- Add status column to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN status TEXT NOT NULL DEFAULT 'available' 
CHECK (status IN ('available', 'sold'));