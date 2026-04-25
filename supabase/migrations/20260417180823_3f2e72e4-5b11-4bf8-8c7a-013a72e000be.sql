CREATE OR REPLACE FUNCTION public.get_admin_notify_recipients()
RETURNS TABLE(email text, display_name text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email::text, COALESCE(p.display_name, split_part(u.email::text, '@', 1)) AS display_name
  FROM auth.users u
  JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'admin'::app_role
  LEFT JOIN public.profiles p ON p.user_id = u.id
  WHERE u.email IS NOT NULL;
$$;

REVOKE ALL ON FUNCTION public.get_admin_notify_recipients() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_notify_recipients() TO service_role;