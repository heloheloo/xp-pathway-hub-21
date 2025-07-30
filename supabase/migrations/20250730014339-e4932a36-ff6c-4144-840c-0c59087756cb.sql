-- Fix the infinite recursion issue in profiles RLS policies
-- The issue is that the RLS policies are calling get_current_user_role() which queries the profiles table,
-- creating a recursive loop when the policies themselves are checking profiles access

-- First, let's create a simple function that doesn't cause recursion by avoiding policy checks
CREATE OR REPLACE FUNCTION public.get_user_role_direct(user_uuid uuid)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Update the get_current_user_role function to use the direct function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
  SELECT COALESCE(public.get_user_role_direct(auth.uid()), 'anonymous');
$$;

-- Now let's fix the profiles policies to avoid recursion
-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view profiles in their group" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their group" ON public.profiles;

-- Create new policies that avoid the recursion
CREATE POLICY "Admins can view profiles in their group" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role IN ('admin', 'superadmin')
    AND (
      admin_profile.role = 'superadmin' OR
      admin_profile.group_id = profiles.group_id
    )
  )
);

CREATE POLICY "Admins can update profiles in their group" ON public.profiles
FOR UPDATE USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role IN ('admin', 'superadmin')
    AND (
      admin_profile.role = 'superadmin' OR
      admin_profile.group_id = profiles.group_id
    )
  )
);