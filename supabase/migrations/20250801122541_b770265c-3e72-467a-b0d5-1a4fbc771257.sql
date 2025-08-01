-- First, let's create a proper superadmin user in the profiles table
-- We'll check if it exists first to avoid conflicts

DO $$
BEGIN
  -- Check if superadmin user already exists
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = 'superadmin' AND role = 'superadmin'
  ) THEN
    -- Insert the superadmin profile
    INSERT INTO public.profiles (
      id,
      user_id, 
      username,
      email,
      role,
      status,
      xp,
      level
    ) VALUES (
      gen_random_uuid(),
      'superadmin-backend-id'::uuid,
      'superadmin',
      'superadmin@example.com',
      'superadmin',
      'active',
      0,
      1
    );
  END IF;
END $$;

-- Update RLS policies to allow superadmin to manage everything
-- First, ensure profiles policies allow superadmin operations
DROP POLICY IF EXISTS "Superadmins can insert all profiles" ON public.profiles;
CREATE POLICY "Superadmins can insert all profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles sp 
    WHERE sp.user_id = auth.uid() AND sp.role = 'superadmin'
  ) OR
  -- Allow the superadmin backend user to operate
  auth.uid()::text = 'superadmin-backend-id'
);

-- Update the groups policy to allow superadmin backend operations
DROP POLICY IF EXISTS "SuperAdmins can manage groups" ON public.groups;
CREATE POLICY "SuperAdmins can manage groups" 
ON public.groups 
FOR ALL 
USING (
  auth.uid() IS NULL OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ) OR
  -- Allow the superadmin backend user to operate
  auth.uid()::text = 'superadmin-backend-id'
);

-- Make sure admin_tasks policies work for superadmin
DROP POLICY IF EXISTS "Superadmins can manage all admin tasks" ON public.admin_tasks;
CREATE POLICY "Superadmins can manage all admin tasks" 
ON public.admin_tasks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ) OR
  -- Allow the superadmin backend user to operate
  auth.uid()::text = 'superadmin-backend-id'
);

-- Allow superadmins to view all profiles
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON public.profiles;
CREATE POLICY "Superadmins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles sp 
    WHERE sp.user_id = auth.uid() AND sp.role = 'superadmin'
  ) OR
  -- Allow the superadmin backend user to operate
  auth.uid()::text = 'superadmin-backend-id'
);

-- Allow superadmins to update all profiles
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON public.profiles;
CREATE POLICY "Superadmins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles sp 
    WHERE sp.user_id = auth.uid() AND sp.role = 'superadmin'
  ) OR
  -- Allow the superadmin backend user to operate
  auth.uid()::text = 'superadmin-backend-id'
);

-- Allow superadmins to delete profiles if needed
DROP POLICY IF EXISTS "Superadmins can delete profiles" ON public.profiles;
CREATE POLICY "Superadmins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles sp 
    WHERE sp.user_id = auth.uid() AND sp.role = 'superadmin'
  ) OR
  -- Allow the superadmin backend user to operate
  auth.uid()::text = 'superadmin-backend-id'
);

-- Update the security definer function to handle superadmin role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Handle the backend superadmin user
  IF auth.uid()::text = 'superadmin-backend-id' THEN
    RETURN 'superadmin';
  END IF;
  
  -- Handle regular users
  RETURN (SELECT role FROM public.profiles WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;