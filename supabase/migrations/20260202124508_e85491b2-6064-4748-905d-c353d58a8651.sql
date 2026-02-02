-- Fix 1: Categories table - restrict write access to admin/manager roles
DROP POLICY IF EXISTS "Public can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;

CREATE POLICY "Authenticated users can view categories" 
  ON public.categories 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and managers can manage categories" 
  ON public.categories 
  FOR ALL 
  USING (is_admin_or_manager(auth.uid()));

-- Fix 2: Drop the unused email table that stores passwords insecurely
DROP TABLE IF EXISTS public.email;