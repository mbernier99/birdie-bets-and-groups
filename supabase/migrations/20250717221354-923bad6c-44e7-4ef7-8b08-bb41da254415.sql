-- Fix database function security vulnerabilities by setting secure search_path
-- This migration updates any remaining functions that don't have secure search_path

-- Update the notify_tournament_participant function with secure search_path
CREATE OR REPLACE FUNCTION public.notify_tournament_participant()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  tournament_data record;
  participant_profile record;
  creator_profile record;
  payload jsonb;
BEGIN
  -- Only send notifications for new participants (not updates)
  IF TG_OP = 'UPDATE' THEN
    RETURN NEW;
  END IF;

  -- Get tournament details
  SELECT t.*, c.name as course_name, c.location as course_location
  INTO tournament_data
  FROM public.tournaments t
  LEFT JOIN public.courses c ON t.course_id = c.id
  WHERE t.id = NEW.tournament_id;

  -- Get participant profile
  SELECT * INTO participant_profile
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Get tournament creator profile
  SELECT * INTO creator_profile
  FROM public.profiles
  WHERE id = tournament_data.created_by;

  -- Skip notification if participant is the tournament creator
  IF NEW.user_id = tournament_data.created_by THEN
    RETURN NEW;
  END IF;

  -- Skip if participant doesn't have an email
  IF participant_profile.email IS NULL THEN
    RETURN NEW;
  END IF;

  -- Prepare payload for edge function
  payload := jsonb_build_object(
    'tournament', jsonb_build_object(
      'id', tournament_data.id,
      'name', tournament_data.name,
      'description', tournament_data.description,
      'start_time', tournament_data.start_time,
      'entry_fee', tournament_data.entry_fee,
      'game_type', tournament_data.game_type,
      'course_name', tournament_data.course_name,
      'course_location', tournament_data.course_location
    ),
    'host', jsonb_build_object(
      'name', COALESCE(creator_profile.first_name || ' ' || creator_profile.last_name, creator_profile.email),
      'email', creator_profile.email
    ),
    'invitees', jsonb_build_array(
      jsonb_build_object(
        'name', COALESCE(participant_profile.first_name || ' ' || participant_profile.last_name, participant_profile.email),
        'email', participant_profile.email
      )
    ),
    'notification_type', 'participant_added'
  );

  -- Call the edge function asynchronously using pg_net (if available)
  -- Note: This is a fire-and-forget approach to avoid blocking the transaction
  BEGIN
    PERFORM
      net.http_post(
        url := 'https://oxwauckpccujkwfagogf.supabase.co/functions/v1/send-tournament-invitation',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
        body := payload
      );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send tournament notification: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;