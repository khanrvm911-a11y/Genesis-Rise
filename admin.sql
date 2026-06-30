-- ============================================================================
-- Admin Dashboard Schema for Genesis Rise
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- 1. ADD is_admin COLUMN TO profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NOTIFICATIONS TABLE (admin sent)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT 'Bell',
    category TEXT DEFAULT 'system',
    priority TEXT DEFAULT 'normal',
    target_audience TEXT DEFAULT 'all',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_scheduled_at ON public.admin_notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_sent_at ON public.admin_notifications(sent_at);

-- 5. RPC: CHECK IF USER IS ADMIN
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result BOOLEAN;
BEGIN
    SELECT COALESCE(is_admin, false) INTO result FROM public.profiles WHERE id = check_user_id;
    RETURN result;
END;
$$;

-- 6. RPC: GET DASHBOARD STATS
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RETURN jsonb_build_object('error', 'Unauthorized');
    END IF;

    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'active_today', (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '24 hours'),
        'new_this_week', (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days'),
        'total_workouts', (SELECT COALESCE(SUM((value::jsonb->>'count')::int), 0) FROM jsonb_each((SELECT COALESCE(jsonb_agg(data), '[]'::jsonb) FROM daily_goals))),
        'total_xp', (SELECT COALESCE(SUM(xp), 0) FROM profiles)
    ) INTO result;

    RETURN result;
END;
$$;

-- 7. RPC: LOG ADMIN ACTION
CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    log_id UUID;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details, ip_address)
    VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details, current_setting('request.headers', true)::json->>'x-forwarded-for')
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$;

-- 8. RPC: GET ALL USERS FOR ADMIN
CREATE OR REPLACE FUNCTION public.admin_get_users(
    p_search TEXT DEFAULT '',
    p_page INT DEFAULT 1,
    p_page_size INT DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSONB;
    offset_val INT;
BEGIN
    IF NOT public.is_admin() THEN
        RETURN jsonb_build_object('error', 'Unauthorized');
    END IF;

    offset_val := (p_page - 1) * p_page_size;

    SELECT jsonb_build_object(
        'users', COALESCE(jsonb_agg(jsonb_build_object(
            'id', p.id,
            'email', p.email,
            'username', p.username,
            'level', p.level,
            'xp', p.xp,
            'rank', p.rank,
            'is_admin', p.is_admin,
            'created_at', p.created_at,
            'last_sign_in', u.last_sign_in_at,
            'email_confirmed', u.email_confirmed_at IS NOT NULL
        ) ORDER BY p.created_at DESC), '[]'::jsonb),
        'total', (SELECT COUNT(*) FROM profiles p2 WHERE
            (p_search = '' OR p2.username ILIKE '%' || p_search || '%' OR p2.email ILIKE '%' || p_search || '%'))
    ) INTO result
    FROM profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE (p_search = '' OR p.username ILIKE '%' || p_search || '%' OR p.email ILIKE '%' || p_search || '%')
    LIMIT p_page_size OFFSET offset_val;

    RETURN result;
END;
$$;

-- 9. RPC: ADMIN UPDATE USER
CREATE OR REPLACE FUNCTION public.admin_update_user(
    p_user_id UUID,
    p_username TEXT DEFAULT NULL,
    p_level INT DEFAULT NULL,
    p_xp INT DEFAULT NULL,
    p_rank TEXT DEFAULT NULL,
    p_is_admin BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RETURN jsonb_build_object('error', 'Unauthorized');
    END IF;

    UPDATE public.profiles SET
        username = COALESCE(p_username, username),
        level = COALESCE(p_level, level),
        xp = COALESCE(p_xp, xp),
        rank = COALESCE(p_rank, rank),
        is_admin = COALESCE(p_is_admin, is_admin)
    WHERE id = p_user_id;

    SELECT jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
            'id', id, 'email', email, 'username', username,
            'level', level, 'xp', xp, 'rank', rank, 'is_admin', is_admin
        )
    ) INTO result FROM profiles WHERE id = p_user_id;

    RETURN result;
END;
$$;

-- 10. RPC: ADMIN DELETE USER (CASCADING)
CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result JSONB;
BEGIN
    IF NOT public.is_admin() THEN
        RETURN jsonb_build_object('error', 'Unauthorized');
    END IF;

    DELETE FROM public.daily_goals WHERE user_id = p_user_id;
    DELETE FROM public.power_levels WHERE user_id = p_user_id;
    DELETE FROM public.notifications WHERE user_id = p_user_id;
    DELETE FROM public.profiles WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'message', 'User data deleted');
END;
$$;

-- 11. RLS POLICIES FOR ADMIN ACCESS
DROP POLICY IF EXISTS "admin_all_access_profiles" ON public.profiles;
CREATE POLICY "admin_all_access_profiles" ON public.profiles
    FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_all_access_power_levels" ON public.power_levels;
CREATE POLICY "admin_all_access_power_levels" ON public.power_levels
    FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_all_access_daily_goals" ON public.daily_goals;
CREATE POLICY "admin_all_access_daily_goals" ON public.daily_goals
    FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_all_access_notifications" ON public.notifications;
CREATE POLICY "admin_all_access_notifications" ON public.notifications
    FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_all_access_audit_logs" ON public.audit_logs;
CREATE POLICY "admin_all_access_audit_logs" ON public.audit_logs
    FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_all_access_admin_notifications" ON public.admin_notifications;
CREATE POLICY "admin_all_access_admin_notifications" ON public.admin_notifications
    FOR ALL USING (public.is_admin(auth.uid()));

-- 12. GRANT ADMIN PRIVILEGES TO SPECIFIC USER
-- Replace 'support.app@gmail.com' with the admin email if different
UPDATE public.profiles
SET is_admin = true
WHERE email = 'support.app@gmail.com';
