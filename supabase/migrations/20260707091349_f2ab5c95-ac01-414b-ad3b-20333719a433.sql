
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can book" ON public.appointments;
CREATE POLICY "Anyone can book" ON public.appointments FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(patient_name)) > 1
    AND length(trim(mobile)) >= 10
    AND appointment_date >= CURRENT_DATE
    AND status = 'pending'
  );
