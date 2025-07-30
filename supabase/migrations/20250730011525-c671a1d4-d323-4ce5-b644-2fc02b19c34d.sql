
-- Add missing columns to profiles table for proper admin management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at_profile timestamp with time zone DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Update groups table to track admin assignments and student counts
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create a function to count students in a group
CREATE OR REPLACE FUNCTION get_group_student_count(group_uuid uuid)
RETURNS integer
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM profiles
  WHERE group_id = group_uuid AND role = 'student';
$$;

-- Create a function to get current user's role (to prevent RLS recursion)
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS text
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid();
$$;

-- Update RLS policies for profiles to use the security definer function
DROP POLICY IF EXISTS "Admins can view profiles in their group" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles in their group" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert students" ON public.profiles;

CREATE POLICY "Admins can view profiles in their group" ON public.profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    (
      get_current_user_role() IN ('admin', 'superadmin') AND
      (
        get_current_user_role() = 'superadmin' OR
        EXISTS (
          SELECT 1 FROM profiles admin_profile
          WHERE admin_profile.user_id = auth.uid()
          AND admin_profile.group_id = profiles.group_id
        )
      )
    )
  );

CREATE POLICY "Admins can update profiles in their group" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (
      get_current_user_role() IN ('admin', 'superadmin') AND
      (
        get_current_user_role() = 'superadmin' OR
        EXISTS (
          SELECT 1 FROM profiles admin_profile
          WHERE admin_profile.user_id = auth.uid()
          AND admin_profile.group_id = profiles.group_id
        )
      )
    )
  );

CREATE POLICY "Admins can insert students" ON public.profiles
  FOR INSERT WITH CHECK (
    get_current_user_role() IN ('admin', 'superadmin')
  );

-- Update groups RLS policies
DROP POLICY IF EXISTS "SuperAdmins can manage groups" ON public.groups;
CREATE POLICY "SuperAdmins can manage groups" ON public.groups
  FOR ALL USING (get_current_user_role() = 'superadmin');

-- Add trigger to update groups.admin_id when a profile's group changes
CREATE OR REPLACE FUNCTION update_group_admin()
RETURNS trigger AS $$
BEGIN
  -- If this is an admin being assigned to a group, update the group's admin_id
  IF NEW.role = 'admin' AND NEW.group_id IS NOT NULL THEN
    UPDATE groups 
    SET admin_id = NEW.id 
    WHERE id = NEW.group_id;
  END IF;
  
  -- If an admin is being removed from a group, clear the group's admin_id
  IF OLD.role = 'admin' AND (NEW.group_id IS NULL OR NEW.group_id != OLD.group_id) THEN
    UPDATE groups 
    SET admin_id = NULL 
    WHERE id = OLD.group_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_group_admin
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_group_admin();

-- Enable realtime for profiles and groups
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.groups REPLICA IDENTITY FULL;
ALTER TABLE public.meets REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meets;
