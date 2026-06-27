-- Add avatar columns to the profiles table
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS avatar_type TEXT DEFAULT 'initial';

COMMENT ON COLUMN public.profiles.avatar IS 'Avatar data: preset ID or data URL for custom images';
COMMENT ON COLUMN public.profiles.avatar_type IS 'Avatar type: initial, preset, or custom';

NOTIFY pgrst, 'reload schema';
