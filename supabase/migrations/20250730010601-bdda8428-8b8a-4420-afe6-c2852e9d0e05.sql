
-- Create projects table for submissions
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  project_link text,
  file_name text,
  file_data bytea,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback text,
  xp_awarded integer DEFAULT 0,
  student_id uuid NOT NULL,
  admin_id uuid,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Students can view their own projects
CREATE POLICY "Students can view their own projects" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = projects.student_id
    )
  );

-- Students can insert their own projects
CREATE POLICY "Students can create projects" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.id = projects.student_id
    )
  );

-- Admins can view and manage projects in their group
CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.user_id = auth.uid()
      AND admin_profile.role IN ('admin', 'superadmin')
      AND (
        admin_profile.role = 'superadmin' OR
        EXISTS (
          SELECT 1 FROM profiles student_profile
          WHERE student_profile.id = projects.student_id
          AND student_profile.group_id = admin_profile.group_id
        )
      )
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON public.projects 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create function to update student XP when project is approved
CREATE OR REPLACE FUNCTION update_student_xp_on_project_approval()
RETURNS trigger AS $$
BEGIN
  -- If status changed to approved and XP was awarded
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.xp_awarded > 0 THEN
    UPDATE profiles 
    SET xp = xp + NEW.xp_awarded
    WHERE id = NEW.student_id;
  END IF;
  
  -- If status changed from approved to something else, remove XP
  IF OLD.status = 'approved' AND NEW.status != 'approved' AND OLD.xp_awarded > 0 THEN
    UPDATE profiles 
    SET xp = GREATEST(0, xp - OLD.xp_awarded)
    WHERE id = NEW.student_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_xp_on_project_approval
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE PROCEDURE update_student_xp_on_project_approval();

-- Update profiles table to have proper relationships
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_group 
  FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE SET NULL;

-- Add trigger to update level when XP changes
CREATE OR REPLACE TRIGGER trigger_update_level_on_xp_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.xp IS DISTINCT FROM NEW.xp)
  EXECUTE PROCEDURE update_level_on_xp_change();

-- Add trigger to update level on insert
CREATE OR REPLACE TRIGGER trigger_update_level_on_insert
  BEFORE INSERT ON public.profiles
  FOR each ROW
  EXECUTE PROCEDURE update_level_on_xp_change();
