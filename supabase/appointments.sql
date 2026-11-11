-- Appointment MVP. Apply after schema.sql and auth.sql in Supabase SQL Editor.
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'unavailable')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT doctor_availability_duration CHECK (ends_at = starts_at + INTERVAL '30 minutes'),
  CONSTRAINT doctor_availability_utc_slot CHECK (EXTRACT(EPOCH FROM starts_at)::BIGINT % 1800 = 0),
  CONSTRAINT doctor_availability_doctor_start UNIQUE (doctor_id, starts_at)
);

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.doctor_availability(id) ON DELETE RESTRICT,
  appointment_type TEXT NOT NULL DEFAULT 'in_person' CHECK (appointment_type IN ('in_person', 'online')),
  reason TEXT CHECK (reason IS NULL OR char_length(reason) <= 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS appointments_one_active_per_slot
  ON public.appointments(slot_id) WHERE status IN ('pending', 'confirmed');
CREATE INDEX IF NOT EXISTS appointments_patient_schedule
  ON public.appointments(patient_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS appointments_doctor_schedule
  ON public.appointments(doctor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS availability_open_by_doctor_time
  ON public.doctor_availability(doctor_id, starts_at) WHERE status = 'available';

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Verified doctors manage own availability" ON public.doctor_availability;
DROP POLICY IF EXISTS "Users view available verified doctor slots" ON public.doctor_availability;
DROP POLICY IF EXISTS "Appointment participants view their appointments" ON public.appointments;

CREATE POLICY "Verified doctors view own availability"
ON public.doctor_availability FOR SELECT TO authenticated
USING (
  doctor_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles p JOIN public.doctor_profiles d ON d.id = p.id
    WHERE p.id = auth.uid() AND p.role = 'doctor' AND d.verification_status = 'verified'
  )
);

CREATE POLICY "Users view available verified doctor slots"
ON public.doctor_availability FOR SELECT TO authenticated
USING (
  (status = 'available' AND starts_at > NOW() AND EXISTS (
    SELECT 1 FROM public.profiles p JOIN public.doctor_profiles d ON d.id = p.id
    WHERE p.id = doctor_id AND p.role = 'doctor' AND d.verification_status = 'verified'
  ))
);

CREATE POLICY "Appointment participants view their appointments"
ON public.appointments FOR SELECT TO authenticated
USING (
  patient_id = auth.uid() OR (doctor_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.doctor_profiles d WHERE d.id = auth.uid() AND d.verification_status = 'verified'
  ))
);

-- No direct appointment INSERT/UPDATE/DELETE policies: all mutations use these RPCs.
CREATE OR REPLACE FUNCTION public.create_appointment(
  p_slot_id UUID,
  p_appointment_type TEXT,
  p_reason TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_slot public.doctor_availability%ROWTYPE;
  v_appointment_id UUID;
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'patient'::public.user_role THEN
    RAISE EXCEPTION 'Only authenticated patients can request appointments' USING ERRCODE = '42501';
  END IF;
  IF p_appointment_type NOT IN ('in_person', 'online') OR char_length(COALESCE(p_reason, '')) > 1000 THEN
    RAISE EXCEPTION 'Invalid appointment details' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_slot FROM public.doctor_availability WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND OR v_slot.status <> 'available' OR v_slot.starts_at <= NOW() THEN
    RAISE EXCEPTION 'This appointment slot is no longer available' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p JOIN public.doctor_profiles d ON d.id = p.id
    WHERE p.id = v_slot.doctor_id AND p.role = 'doctor' AND d.verification_status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Doctor is not available for booking' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.appointments (patient_id, doctor_id, slot_id, appointment_type, reason)
  VALUES (auth.uid(), v_slot.doctor_id, v_slot.id, p_appointment_type, NULLIF(trim(p_reason), ''))
  RETURNING id INTO v_appointment_id;
  UPDATE public.doctor_availability SET status = 'booked' WHERE id = v_slot.id;
  RETURN v_appointment_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_appointment_status(p_appointment_id UUID, p_status TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_appointment public.appointments%ROWTYPE;
  v_role public.user_role;
BEGIN
  v_role := public.current_user_role();
  IF auth.uid() IS NULL OR p_status NOT IN ('confirmed', 'rejected', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Invalid appointment update' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_appointment FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Appointment not found' USING ERRCODE = 'P0002'; END IF;
  IF v_role = 'doctor' AND NOT EXISTS (
    SELECT 1 FROM public.doctor_profiles d WHERE d.id = auth.uid() AND d.verification_status = 'verified'
  ) THEN
    RAISE EXCEPTION 'Only verified doctors can manage appointments' USING ERRCODE = '42501';
  END IF;

  IF v_role = 'patient' AND v_appointment.patient_id = auth.uid() AND p_status = 'cancelled'
     AND v_appointment.status IN ('pending', 'confirmed') THEN
    NULL;
  ELSIF v_role = 'doctor' AND v_appointment.doctor_id = auth.uid()
     AND v_appointment.status = 'pending' AND p_status IN ('confirmed', 'rejected') THEN
    IF NOT EXISTS (SELECT 1 FROM public.doctor_profiles d WHERE d.id = auth.uid() AND d.verification_status = 'verified') THEN
      RAISE EXCEPTION 'Only verified doctors can manage appointment requests' USING ERRCODE = '42501';
    END IF;
  ELSIF v_role = 'doctor' AND v_appointment.doctor_id = auth.uid()
     AND v_appointment.status = 'confirmed' AND p_status IN ('completed', 'cancelled') THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Appointment status transition is not permitted' USING ERRCODE = '42501';
  END IF;

  UPDATE public.appointments
  SET status = p_status, updated_at = NOW()
  WHERE id = v_appointment.id;
  IF p_status IN ('rejected', 'cancelled') THEN
    UPDATE public.doctor_availability
    SET status = CASE WHEN starts_at > NOW() THEN 'available' ELSE 'unavailable' END
    WHERE id = v_appointment.slot_id;
  END IF;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_doctor_availability(p_starts_at TIMESTAMPTZ)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_slot_id UUID;
BEGIN
  IF auth.uid() IS NULL OR public.current_user_role() IS DISTINCT FROM 'doctor'::public.user_role
     OR NOT EXISTS (SELECT 1 FROM public.doctor_profiles d WHERE d.id = auth.uid() AND d.verification_status = 'verified') THEN
    RAISE EXCEPTION 'Only verified doctors can add appointment availability' USING ERRCODE = '42501';
  END IF;
  IF p_starts_at <= NOW() OR p_starts_at > NOW() + INTERVAL '90 days'
     OR EXTRACT(EPOCH FROM p_starts_at)::BIGINT % 1800 <> 0 THEN
    RAISE EXCEPTION 'Choose a future half-hour UTC slot' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.doctor_availability (doctor_id, starts_at, ends_at)
  VALUES (auth.uid(), p_starts_at, p_starts_at + INTERVAL '30 minutes')
  RETURNING id INTO v_slot_id;
  RETURN v_slot_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_doctor_availability(p_slot_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.doctor_availability
  WHERE id = p_slot_id AND doctor_id = auth.uid() AND status = 'available' AND starts_at > NOW();
  IF NOT FOUND THEN RAISE EXCEPTION 'Slot unavailable or already booked' USING ERRCODE = 'P0001'; END IF;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.list_my_appointments()
RETURNS TABLE (
  id UUID, patient_id UUID, doctor_id UUID, slot_id UUID, starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ, appointment_type TEXT, reason TEXT, status TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  patient_name TEXT, patient_username TEXT, doctor_name TEXT, doctor_username TEXT,
  specialization TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT a.id, a.patient_id, a.doctor_id, a.slot_id, s.starts_at, s.ends_at,
    a.appointment_type, a.reason, a.status, a.created_at, a.updated_at,
    patient.full_name, patient.username, doctor.full_name, doctor.username, dp.specialization
  FROM public.appointments a
  JOIN public.doctor_availability s ON s.id = a.slot_id
  JOIN public.profiles patient ON patient.id = a.patient_id
  JOIN public.profiles doctor ON doctor.id = a.doctor_id
  JOIN public.doctor_profiles dp ON dp.id = a.doctor_id
  WHERE auth.uid() = a.patient_id OR (auth.uid() = a.doctor_id AND EXISTS (
    SELECT 1 FROM public.doctor_profiles verified_doctor
    WHERE verified_doctor.id = auth.uid() AND verified_doctor.verification_status = 'verified'
  ));
$$;

REVOKE INSERT, UPDATE, DELETE ON public.doctor_availability FROM authenticated;
REVOKE ALL ON FUNCTION public.create_appointment(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_appointment_status(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_doctor_availability(TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.remove_doctor_availability(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_my_appointments() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_appointment(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_appointment_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_doctor_availability(TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_doctor_availability(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_appointments() TO authenticated;
