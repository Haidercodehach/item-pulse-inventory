-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'employee');

-- Create enum for transaction types
CREATE TYPE public.transaction_type AS ENUM ('stock_in', 'stock_out', 'adjustment', 'transfer');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  supplier_id UUID REFERENCES public.suppliers(id),
  quantity INTEGER DEFAULT 0 CHECK (quantity >= 0),
  min_stock_level INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  cost DECIMAL(10,2) DEFAULT 0,
  barcode TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_transactions table
CREATE TABLE public.inventory_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Create function to check if user has admin or manager role
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(user_id UUID)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'manager')
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for categories
CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and managers can manage categories" ON public.categories
  FOR ALL USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for suppliers
CREATE POLICY "Everyone can view suppliers" ON public.suppliers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and managers can manage suppliers" ON public.suppliers
  FOR ALL USING (public.is_admin_or_manager(auth.uid()));

-- RLS Policies for inventory_items
CREATE POLICY "Everyone can view inventory items" ON public.inventory_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can create inventory items" ON public.inventory_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and managers can update inventory items" ON public.inventory_items
  FOR UPDATE USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Admins can delete inventory items" ON public.inventory_items
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for inventory_transactions
CREATE POLICY "Everyone can view transactions" ON public.inventory_transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Everyone can create transactions" ON public.inventory_transactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete transactions" ON public.inventory_transactions
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'employee'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update inventory quantity
CREATE OR REPLACE FUNCTION public.update_inventory_quantity(
  item_id UUID,
  quantity_change INTEGER,
  transaction_type_param transaction_type,
  unit_cost_param DECIMAL DEFAULT NULL,
  reference_number_param TEXT DEFAULT NULL,
  notes_param TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_quantity INTEGER;
  new_quantity INTEGER;
  total_cost_calc DECIMAL;
BEGIN
  -- Get current quantity
  SELECT quantity INTO current_quantity
  FROM public.inventory_items
  WHERE id = item_id;
  
  -- Calculate new quantity
  new_quantity := current_quantity + quantity_change;
  
  -- Ensure quantity doesn't go negative
  IF new_quantity < 0 THEN
    RAISE EXCEPTION 'Insufficient stock. Current quantity: %, Requested change: %', current_quantity, quantity_change;
  END IF;
  
  -- Calculate total cost
  total_cost_calc := COALESCE(unit_cost_param, 0) * ABS(quantity_change);
  
  -- Update inventory item
  UPDATE public.inventory_items
  SET quantity = new_quantity,
      updated_at = NOW()
  WHERE id = item_id;
  
  -- Insert transaction record
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
    item_id,
    transaction_type_param,
    quantity_change,
    current_quantity,
    new_quantity,
    unit_cost_param,
    total_cost_calc,
    reference_number_param,
    notes_param,
    auth.uid()
  );
END;
$$;

-- Enable realtime for inventory updates
ALTER TABLE public.inventory_items REPLICA IDENTITY FULL;
ALTER TABLE public.inventory_transactions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_transactions;

-- Insert some sample data
INSERT INTO public.categories (name, description) VALUES
  ('Shop One', 'Shop One'),
  ('Shop Two', 'Shop Two');

INSERT INTO public.suppliers (name, contact_person, email, phone) VALUES
  ('TechCorp Solutions', 'John Smith', 'john@techcorp.com', '+1-555-0101'),
  ('Office Depot', 'Sarah Johnson', 'sarah@officedepot.com', '+1-555-0102'),
  ('ToolMaster Inc', 'Mike Wilson', 'mike@toolmaster.com', '+1-555-0103');
