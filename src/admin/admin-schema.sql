-- Admin Schema for Genesis Rise
-- Run entire file in Supabase SQL Editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

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

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_scheduled_at ON public.admin_notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_sent_at ON public.admin_notifications(sent_at);

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE result BOOLEAN;
BEGIN
    SELECT COALESCE(is_admin, false) INTO result FROM public.profiles WHERE id = check_user_id;
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(
    p_action TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE log_id UUID;
BEGIN
    IF NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
    INSERT INTO public.audit_logs (admin_id, action, target_type, target_id, details)
    VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details)
    RETURNING id INTO log_id;
    RETURN log_id;
END;
$$;

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

UPDATE public.profiles SET is_admin = true WHERE email = 'support.app@gmail.com';
