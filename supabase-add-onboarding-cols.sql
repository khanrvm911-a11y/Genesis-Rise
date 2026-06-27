-- Add onboarding columns to the profiles table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- Add all onboarding columns (safe to re-run, uses IF NOT EXISTS)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS goal TEXT,
  ADD COLUMN IF NOT EXISTS experience TEXT,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS workout_days INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Whether the user has completed first-time onboarding';
COMMENT ON COLUMN public.profiles.goal IS 'User fitness goal: Build Muscle, Lose Fat, Improve Fitness, Increase Strength, Maintain Health';
COMMENT ON COLUMN public.profiles.experience IS 'User fitness experience: Beginner, Intermediate, Advanced';
COMMENT ON COLUMN public.profiles.height_cm IS 'User height in centimeters';
COMMENT ON COLUMN public.profiles.weight_kg IS 'User weight in kilograms';
COMMENT ON COLUMN public.profiles.age IS 'User age in years';
COMMENT ON COLUMN public.profiles.workout_days IS 'Desired workout days per week (1-7)';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of last profile update';

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Refresh the schema cache so new columns are immediately available
-- (click the "Refresh" button in the SQL Editor or run:)
NOTIFY pgrst, 'reload schema';
