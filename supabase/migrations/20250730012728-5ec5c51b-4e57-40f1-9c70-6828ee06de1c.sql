
-- Create the superadmin user in the auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'superadmin@example.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"username": "superadmin"}',
  false,
  'authenticated'
);

-- Create the corresponding profile for the superadmin
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
