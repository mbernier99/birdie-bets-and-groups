-- Add nickname field to profiles table (if not exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nickname text;

-- Create a function to get display name (prioritizes nickname > first_name > email)
CREATE OR REPLACE FUNCTION public.get_display_name(profile_row public.profiles)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    profile_row.nickname,
    profile_row.first_name,
    profile_row.email
  )
$$;

-- Function to upsert user and profile
CREATE OR REPLACE FUNCTION create_or_update_test_user(
  p_email text,
  p_first_name text,
  p_last_name text,
  p_nickname text,
  p_phone text,
  p_handicap integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Try to find existing user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  -- If user doesn't exist, create them
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      gen_random_uuid(), '00000000-0000-0000-0000-000000000000', p_email,
      crypt('BandonTest2025!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('first_name', p_first_name, 'last_name', p_last_name),
      now(), now(), '', '', '', ''
    )
    RETURNING id INTO v_user_id;
  END IF;
  
  -- Upsert profile
  INSERT INTO public.profiles (id, email, first_name, last_name, nickname, phone, handicap, home_course)
  VALUES (v_user_id, p_email, p_first_name, p_last_name, p_nickname, p_phone, p_handicap, 'Bandon Dunes')
  ON CONFLICT (id) DO UPDATE
  SET first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      nickname = EXCLUDED.nickname,
      phone = EXCLUDED.phone,
      handicap = EXCLUDED.handicap,
      home_course = EXCLUDED.home_course;
  
  RETURN v_user_id;
END;
$$;

-- Create/update all 8 Bandon Dunes players
SELECT create_or_update_test_user('leecrocker@gmail.com', 'Lee', 'Crocker', 'SussPro', '415-640-7054', 18);
SELECT create_or_update_test_user('erwhalen@yahoo.com', 'Erin', 'Whalen', 'WhaleBone', '415-254-9188', 15);
SELECT create_or_update_test_user('drew.tornga@gmail.com', 'Drew', 'Tornga', 'Tornganese', '530-906-5466', 22);
SELECT create_or_update_test_user('saldivarhector@hotmail.com', 'Hector', 'Saldivar', 'El Presidente', '415-420-2820', 13);
SELECT create_or_update_test_user('mbernier@gmail.com', 'Matt', 'Bernier', 'Berniator', '415-846-2591', 12);
SELECT create_or_update_test_user('scogo82@hotmail.com', 'Scott', 'Gannon', 'JamBand', '415-377-0156', 17);
SELECT create_or_update_test_user('tom.connaghan@bandongolf.temp', 'Tom', 'Connaghan', 'ConMan', '650-906-3288', 14);
SELECT create_or_update_test_user('matt.traiman@gmail.com', 'Matt', 'Traimain', 'TraiDog', '925-282-9223', 18);

-- Clean up the helper function
DROP FUNCTION create_or_update_test_user;