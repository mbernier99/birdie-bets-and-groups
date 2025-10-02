-- Create groups table for saving player rosters
CREATE TABLE IF NOT EXISTS public.player_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create group members junction table
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.player_groups(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  handicap integer,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(group_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.player_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for player_groups
CREATE POLICY "Users can view their own groups"
  ON public.player_groups
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groups"
  ON public.player_groups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
  ON public.player_groups
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
  ON public.player_groups
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for group_members
CREATE POLICY "Users can view members of their groups"
  ON public.group_members
  FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM public.player_groups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to their groups"
  ON public.group_members
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT id FROM public.player_groups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update members in their groups"
  ON public.group_members
  FOR UPDATE
  USING (
    group_id IN (
      SELECT id FROM public.player_groups WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete members from their groups"
  ON public.group_members
  FOR DELETE
  USING (
    group_id IN (
      SELECT id FROM public.player_groups WHERE user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_player_groups_updated_at
  BEFORE UPDATE ON public.player_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();