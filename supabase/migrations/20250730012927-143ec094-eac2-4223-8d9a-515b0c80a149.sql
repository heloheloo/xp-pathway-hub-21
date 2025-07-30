
-- First, let's clean up the existing superadmin user if it exists
DELETE FROM public.profiles WHERE username = 'superadmin';
DELETE FROM auth.users WHERE email = 'superadmin@example.com';

-- Create the superadmin user using Supabase's auth.admin_create_user function
-- This ensures proper password hashing and user setup
SELECT auth.admin_create_user(
  json_build_object(
    'email', 'superadmin@example.com',
    'password', 'demo123',
    'email_confirm', true,
    'user_metadata', json_build_object('username', 'superadmin')
  )
);

-- Get the user ID for the superadmin
-- Create the profile entry for superadmin
INSERT INTO public.profiles (
  user_id,
  username,
  email,
  role,
  status,
  xp,
  level
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'superadmin@example.com'),
  'superadmin',
  'superadmin@example.com',
  'superadmin',
  'active',
  0,
  1
);
