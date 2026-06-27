-- Security hardening for Genesis Rise
-- Run this in the Supabase SQL Editor after the base schema files.

-- Keep avatar rows bounded if custom images are still stored as data URLs.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_avatar_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_type_check
  CHECK (avatar_type IN ('initial', 'preset', 'custom')) NOT VALID;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_avatar_size_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_avatar_size_check
  CHECK (avatar IS NULL OR char_length(avatar) <= 3000000) NOT VALID;

-- Tables referenced by the offline sync engine.
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.health_logs (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

CREATE TABLE IF NOT EXISTS public.weekly_schedule (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  plan_id TEXT,
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day_of_week)
);

ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS client_id TEXT;

CREATE INDEX IF NOT EXISTS idx_weight_entries_user_id ON public.weight_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_entries_date ON public.weight_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON public.health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_schedule_user_id ON public.weekly_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_client_id ON public.workout_sets(client_id);

CREATE OR REPLACE FUNCTION public.set_row_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_health_logs_updated_at ON public.health_logs;
CREATE TRIGGER trg_health_logs_updated_at
  BEFORE UPDATE ON public.health_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_updated_at();

DROP TRIGGER IF EXISTS trg_weekly_schedule_updated_at ON public.weekly_schedule;
CREATE TRIGGER trg_weekly_schedule_updated_at
  BEFORE UPDATE ON public.weekly_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.set_row_updated_at();

ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "weight_entries_select_own" ON public.weight_entries;
CREATE POLICY "weight_entries_select_own" ON public.weight_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_entries_insert_own" ON public.weight_entries;
CREATE POLICY "weight_entries_insert_own" ON public.weight_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_entries_update_own" ON public.weight_entries;
CREATE POLICY "weight_entries_update_own" ON public.weight_entries
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "weight_entries_delete_own" ON public.weight_entries;
CREATE POLICY "weight_entries_delete_own" ON public.weight_entries
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "health_logs_select_own" ON public.health_logs;
CREATE POLICY "health_logs_select_own" ON public.health_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "health_logs_insert_own" ON public.health_logs;
CREATE POLICY "health_logs_insert_own" ON public.health_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "health_logs_update_own" ON public.health_logs;
CREATE POLICY "health_logs_update_own" ON public.health_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "health_logs_delete_own" ON public.health_logs;
CREATE POLICY "health_logs_delete_own" ON public.health_logs
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "weekly_schedule_select_own" ON public.weekly_schedule;
CREATE POLICY "weekly_schedule_select_own" ON public.weekly_schedule
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "weekly_schedule_insert_own" ON public.weekly_schedule;
CREATE POLICY "weekly_schedule_insert_own" ON public.weekly_schedule
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "weekly_schedule_update_own" ON public.weekly_schedule;
CREATE POLICY "weekly_schedule_update_own" ON public.weekly_schedule
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "weekly_schedule_delete_own" ON public.weekly_schedule;
CREATE POLICY "weekly_schedule_delete_own" ON public.weekly_schedule
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_user UUID := auth.uid();
BEGIN
  IF target_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  DELETE FROM public.weekly_schedule WHERE user_id = target_user;
  DELETE FROM public.health_logs WHERE user_id = target_user;
  DELETE FROM public.weight_entries WHERE user_id = target_user;
  DELETE FROM public.daily_goals WHERE user_id = target_user;
  DELETE FROM public.notifications WHERE user_id = target_user;
  DELETE FROM public.power_levels WHERE user_id = target_user;
  DELETE FROM public.workout_sets WHERE user_id = target_user;
  DELETE FROM public.workout_sessions WHERE user_id = target_user;
  DELETE FROM public.profiles WHERE id = target_user;
  DELETE FROM auth.users WHERE id = target_user;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

NOTIFY pgrst, 'reload schema';
