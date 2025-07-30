-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'superadmin')),
  group_id UUID,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meets table
CREATE TABLE public.meets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  meet_type TEXT NOT NULL CHECK (meet_type IN ('bi_monthly_meet', 'doubt_clearing', 'group_project', 'discussion_forum', 'project_presentation')),
  group_id UUID REFERENCES public.groups(id),
  admin_id UUID REFERENCES public.profiles(id),
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  meet_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin tasks table for monthly tracking
CREATE TABLE public.admin_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  task_type TEXT NOT NULL CHECK (task_type IN ('bi_monthly_meet', 'doubt_clearing', 'group_project', 'discussion_forum', 'project_presentation', 'malayalam_post', 'malayalam_challenge')),
  title TEXT NOT NULL,
  description TEXT,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create xp_transactions table for tracking XP changes
CREATE TABLE public.xp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('project_completion', 'participation', 'achievement', 'bonus', 'deduction')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default groups
INSERT INTO public.groups (name, description) VALUES 
('Group 1', 'First learning group'),
('Group 2', 'Second learning group'),
('Group 3', 'Third learning group');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view profiles in their group" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.role IN ('admin', 'superadmin')
      AND (admin_profile.role = 'superadmin' OR admin_profile.group_id = profiles.group_id)
    )
  );

CREATE POLICY "Admins can insert students" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update profiles in their group" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.role IN ('admin', 'superadmin')
      AND (admin_profile.role = 'superadmin' OR admin_profile.group_id = profiles.group_id)
    )
  );

-- RLS Policies for groups
CREATE POLICY "Everyone can view groups" ON public.groups
  FOR SELECT USING (true);

CREATE POLICY "SuperAdmins can manage groups" ON public.groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- RLS Policies for meets
CREATE POLICY "Group members can view their meets" ON public.meets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (group_id = meets.group_id OR role IN ('admin', 'superadmin'))
    )
  );

CREATE POLICY "Admins can manage meets" ON public.meets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies for admin_tasks
CREATE POLICY "Admins can view their tasks" ON public.admin_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (id = admin_tasks.admin_id OR role = 'superadmin')
    )
  );

CREATE POLICY "Admins can manage their tasks" ON public.admin_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND id = admin_tasks.admin_id
    )
  );

-- RLS Policies for xp_transactions
CREATE POLICY "Students can view their XP transactions" ON public.xp_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND (id = xp_transactions.student_id OR role IN ('admin', 'superadmin'))
    )
  );

CREATE POLICY "Admins can create XP transactions" ON public.xp_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
      AND id = xp_transactions.admin_id
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meets_updated_at
  BEFORE UPDATE ON public.meets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_tasks_updated_at
  BEFORE UPDATE ON public.admin_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(xp_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(xp_points / 100.0) + 1);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update level when XP changes
CREATE OR REPLACE FUNCTION public.update_level_on_xp_change()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = public.calculate_level(NEW.xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_level_trigger
  BEFORE UPDATE OF xp ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_level_on_xp_change();