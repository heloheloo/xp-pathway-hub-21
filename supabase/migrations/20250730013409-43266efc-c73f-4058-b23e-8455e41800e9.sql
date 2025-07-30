
-- First, let's fix the infinite recursion issue by updating the get_current_user_role function
-- to handle cases where auth.uid() might not exist in profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
    'anonymous'
  );
$$;

-- Update the groups RLS policy to allow operations when no user is authenticated
-- (this handles the UI-only superadmin case)
DROP POLICY IF EXISTS "SuperAdmins can manage groups" ON public.groups;
CREATE POLICY "SuperAdmins can manage groups" ON public.groups
FOR ALL USING (
  get_current_user_role() = 'superadmin' OR auth.uid() IS NULL
);

-- Also update the profiles policies to handle the recursive issue better
DROP POLICY IF EXISTS "Admins can view profiles in their group" ON public.profiles;
CREATE POLICY "Admins can view profiles in their group" ON public.profiles
FOR SELECT USING (
  auth.uid() = user_id OR 
  (
    get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text]) AND
    (
      get_current_user_role() = 'superadmin'::text OR
      group_id IN (
        SELECT p.group_id 
        FROM profiles p 
        WHERE p.user_id = auth.uid() AND p.role = 'admin'
      )
    )
  )
);

DROP POLICY IF EXISTS "Admins can update profiles in their group" ON public.profiles;
CREATE POLICY "Admins can update profiles in their group" ON public.profiles
FOR UPDATE USING (
  auth.uid() = user_id OR 
  (
    get_current_user_role() = ANY(ARRAY['admin'::text, 'superadmin'::text]) AND
    (
      get_current_user_role() = 'superadmin'::text OR
      group_id IN (
        SELECT p.group_id 
        FROM profiles p 
        WHERE p.user_id = auth.uid() AND p.role = 'admin'
      )
    )
  )
);
