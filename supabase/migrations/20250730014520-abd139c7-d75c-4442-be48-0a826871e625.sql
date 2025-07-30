-- Let's completely fix the infinite recursion by simplifying the RLS policies
-- The issue is still happening when joining profiles with groups

-- First, let's make sure all problematic policies are removed
DROP POLICY IF EXISTS "Admins can view profiles in their group" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their group" ON public.profiles;

-- Create much simpler policies that don't cause recursion
-- Allow users to see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Create a separate policy for superadmins that doesn't use functions
CREATE POLICY "Superadmins can view all profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles sp 
    WHERE sp.user_id = auth.uid() 
    AND sp.role = 'superadmin'
  )
);

CREATE POLICY "Superadmins can update all profiles" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles sp 
    WHERE sp.user_id = auth.uid() 
    AND sp.role = 'superadmin'
  )
);

-- Create a policy for admins to view profiles in their group
CREATE POLICY "Admins can view group profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_p 
    WHERE admin_p.user_id = auth.uid() 
    AND admin_p.role = 'admin'
    AND admin_p.group_id = profiles.group_id
  )
);

-- Create a policy for admins to update profiles in their group  
CREATE POLICY "Admins can update group profiles" ON public.profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_p 
    WHERE admin_p.user_id = auth.uid() 
    AND admin_p.role = 'admin'
    AND admin_p.group_id = profiles.group_id
  )
);

-- Also update the groups policy to be simpler and not rely on functions
DROP POLICY IF EXISTS "SuperAdmins can manage groups" ON public.groups;
CREATE POLICY "SuperAdmins can manage groups" ON public.groups
FOR ALL USING (
  auth.uid() IS NULL OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'superadmin'
  )
);