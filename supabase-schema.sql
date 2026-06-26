-- ============================================================================
-- Complete Database Schema for Genesis Rise
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/lodkrtwodxgcdbeyxyul/sql/new)
-- ============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- 1.1 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    rank TEXT NOT NULL DEFAULT 'Initiate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 power_levels
CREATE TABLE IF NOT EXISTS public.power_levels (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 0,
    weekly_change INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT DEFAULT '',
    category TEXT DEFAULT 'system',
    icon TEXT DEFAULT 'Bell',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.4 daily_goals
CREATE TABLE IF NOT EXISTS public.daily_goals (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, date)
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_id ON public.daily_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON public.daily_goals(date);

-- ============================================================================
-- 3. RPC FUNCTIONS
-- ============================================================================

-- 3.1 get_email_by_username: Lookup email by username for login
CREATE OR REPLACE FUNCTION public.get_email_by_username(input_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_email TEXT;
BEGIN
    SELECT email INTO user_email
    FROM public.profiles
    WHERE username = input_username
    LIMIT 1;
    RETURN user_email;
END;
$$;

-- 3.2 check_username_exists: Check if a username is already taken
CREATE OR REPLACE FUNCTION public.check_username_exists(input_username TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    exists_bool BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.profiles WHERE username = input_username
    ) INTO exists_bool;
    RETURN exists_bool;
END;
$$;

-- 3.3 check_email_exists: Check if an email is already registered
CREATE OR REPLACE FUNCTION public.check_email_exists(input_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    exists_bool BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM public.profiles WHERE email = input_email
    ) INTO exists_bool;
    RETURN exists_bool;
END;
$$;

-- ============================================================================
-- 4. TRIGGER: Auto-create profile row on user signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, level, xp, rank)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            'user_' || substr(REPLACE(NEW.id::TEXT, '-', ''), 1, 8)
        ),
        1, 0, 'Initiate'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 4.1 Trigger: Auto-update updated_at on power_levels
CREATE OR REPLACE FUNCTION public.update_power_levels_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_power_levels_updated_at ON public.power_levels;
CREATE TRIGGER trg_power_levels_updated_at
    BEFORE UPDATE ON public.power_levels
    FOR EACH ROW
    EXECUTE FUNCTION public.update_power_levels_updated_at();

-- 4.2 Trigger: Auto-update updated_at on daily_goals
CREATE OR REPLACE FUNCTION public.update_daily_goals_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_daily_goals_updated_at ON public.daily_goals;
CREATE TRIGGER trg_daily_goals_updated_at
    BEFORE UPDATE ON public.daily_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_daily_goals_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- 5.1 profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5.2 power_levels RLS
ALTER TABLE public.power_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "power_levels_select_own" ON public.power_levels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "power_levels_insert_own" ON public.power_levels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "power_levels_update_own" ON public.power_levels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "power_levels_delete_own" ON public.power_levels
    FOR DELETE USING (auth.uid() = user_id);

-- 5.3 notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_insert_own" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- 5.4 daily_goals RLS
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_goals_select_own" ON public.daily_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "daily_goals_insert_own" ON public.daily_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_goals_update_own" ON public.daily_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "daily_goals_delete_own" ON public.daily_goals
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 6. ENABLE REALTIME FOR NOTIFICATIONS (for live in-app notifications)
-- ============================================================================
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add notifications table to the realtime publication
-- Note: If you get an error that supabase_realtime doesn't exist,
-- run the create publication line instead (commented out below).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END
$$;
