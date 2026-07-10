
-- Roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'receptionist');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Specialties
CREATE TABLE public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.specialties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.specialties TO authenticated;
GRANT ALL ON public.specialties TO service_role;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active specialties" ON public.specialties FOR SELECT
  TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "Admins manage specialties" ON public.specialties FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Doctors
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE RESTRICT,
  qualifications TEXT,
  consultation_duration INT NOT NULL DEFAULT 20,
  working_days INT[] NOT NULL DEFAULT ARRAY[0,1,2,3,4,6],
  work_start TIME NOT NULL DEFAULT '09:00',
  work_end TIME NOT NULL DEFAULT '17:00',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active doctors" ON public.doctors FOR SELECT
  TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "Admins manage doctors" ON public.doctors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Appointment status
CREATE TYPE public.appointment_status AS ENUM ('pending','confirmed','checked_in','completed','cancelled','no_show');

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE DEFAULT ('AF-' || upper(substr(gen_random_uuid()::text, 1, 8))),
  patient_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
  specialty_id UUID NOT NULL REFERENCES public.specialties(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status appointment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, appointment_date, appointment_time)
);
GRANT SELECT, INSERT ON public.appointments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Anyone can create an appointment
CREATE POLICY "Anyone can book" ON public.appointments FOR INSERT
  TO anon, authenticated WITH CHECK (true);
-- Staff can view/manage all
CREATE POLICY "Staff view appointments" ON public.appointments FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "Staff update appointments" ON public.appointments FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'receptionist'));
CREATE POLICY "Staff delete appointments" ON public.appointments FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Anonymous can read appointment slots (for availability check) - limited to booked slots only
CREATE POLICY "Public reads booked slots" ON public.appointments FOR SELECT
  TO anon USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_specialties_updated BEFORE UPDATE ON public.specialties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed a few specialties and doctors
INSERT INTO public.specialties (name, description) VALUES
  ('General Medicine', 'Comprehensive primary care'),
  ('Pediatrics', 'Care for children and adolescents'),
  ('Dermatology', 'Skin, hair and nails'),
  ('Cardiology', 'Heart and vascular care'),
  ('Dentistry', 'Dental care and oral health');

INSERT INTO public.doctors (name, specialty_id, qualifications, consultation_duration)
SELECT 'Dr. Ahmed Hassan', id, 'MBBCh, MSc Internal Medicine', 20 FROM public.specialties WHERE name='General Medicine';
INSERT INTO public.doctors (name, specialty_id, qualifications, consultation_duration)
SELECT 'Dr. Mona Salah', id, 'MBBCh, Pediatrics Board', 20 FROM public.specialties WHERE name='Pediatrics';
INSERT INTO public.doctors (name, specialty_id, qualifications, consultation_duration)
SELECT 'Dr. Karim Fathy', id, 'MD Dermatology', 15 FROM public.specialties WHERE name='Dermatology';
