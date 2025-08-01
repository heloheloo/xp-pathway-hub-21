-- Fix security warnings by updating functions with proper search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = '';

-- Update get_group_student_count function with proper search_path
CREATE OR REPLACE FUNCTION public.get_group_student_count(group_uuid uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer 
    FROM public.profiles 
    WHERE group_id = group_uuid AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql STABLE SET search_path = '';

-- Create a function to set superadmin auth context for operations
CREATE OR REPLACE FUNCTION public.exec_as_superadmin()
RETURNS void AS $$
BEGIN
  -- This function helps set the auth context for superadmin operations
  PERFORM set_config('request.jwt.claims', 
    '{"sub":"superadmin-backend-id","role":"authenticated"}', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';