-- ============================================================================
-- Workout Auto-Save: Sessions + Individual Sets
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. workout_sessions: one row per workout the user starts
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_name TEXT NOT NULL DEFAULT 'Workout',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    total_duration_seconds INTEGER NOT NULL DEFAULT 0,
    total_volume DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_calories INTEGER NOT NULL DEFAULT 0,
    total_xp INTEGER NOT NULL DEFAULT 0,
    total_sets INTEGER NOT NULL DEFAULT 0,
    exercises_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. workout_sets: one row per completed set
CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    exercise_name TEXT NOT NULL DEFAULT '',
    set_index INTEGER NOT NULL,
    weight DOUBLE PRECISION NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    volume DOUBLE PRECISION NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_status ON public.workout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at ON public.workout_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_id ON public.workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_user_id ON public.workout_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id ON public.workout_sets(exercise_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_workout_sessions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workout_sessions_updated_at ON public.workout_sessions;
CREATE TRIGGER trg_workout_sessions_updated_at
    BEFORE UPDATE ON public.workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_workout_sessions_updated_at();

-- RLS for workout_sessions
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sessions_select_own" ON public.workout_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions_insert_own" ON public.workout_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sessions_update_own" ON public.workout_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workout_sessions_delete_own" ON public.workout_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS for workout_sets
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workout_sets_select_own" ON public.workout_sets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "workout_sets_insert_own" ON public.workout_sets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workout_sets_update_own" ON public.workout_sets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "workout_sets_delete_own" ON public.workout_sets
    FOR DELETE USING (auth.uid() = user_id);
