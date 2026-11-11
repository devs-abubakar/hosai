-- Apply after schema.sql. Public sign-up may create patients and doctors only.
CREATE OR REPLACE FUNCTION public.handle_new_hosai_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  requested_role user_role;
BEGIN
  IF COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient') NOT IN ('patient', 'doctor') THEN
    RAISE EXCEPTION 'Public registration is limited to patient and doctor accounts';
  END IF;

  requested_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient')::user_role;

  INSERT INTO public.profiles (id, email, username, full_name, phone, role, location)
  VALUES (
    NEW.id,
    NEW.email,
    lower(NEW.raw_user_meta_data ->> 'username'),
    NEW.raw_user_meta_data ->> 'full_name',
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    requested_role,
    NULLIF(NEW.raw_user_meta_data ->> 'location', '')
  );

  IF requested_role = 'patient' THEN
    INSERT INTO public.patient_profiles (
      id, date_of_birth, blood_group, gender, emergency_contact_name,
      emergency_contact_phone, emergency_contact_relation
    ) VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'date_of_birth', '')::date, DATE '2000-01-01'),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'blood_group', '')::blood_group, 'O+'::blood_group),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'gender', '')::gender_type, 'prefer_not_to_say'::gender_type),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_name', ''), 'Not provided'),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_phone', ''), 'Not provided'),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'emergency_contact_relation', ''), 'Not provided')
    );
  ELSE
    INSERT INTO public.doctor_profiles (
      id, specialization, qualifications, experience_years, registration_number,
      verification_status, consultation_fee, bio
    ) VALUES (
      NEW.id,
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'specialization', ''), 'General Medicine'),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data -> 'qualifications', '["MBBS"]'::jsonb))),
      GREATEST(0, COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'experience_years', '')::integer, 0)),
      NEW.raw_user_meta_data ->> 'registration_number',
      'pending',
      GREATEST(0, COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'consultation_fee', '')::numeric, 0)),
      NULLIF(NEW.raw_user_meta_data ->> 'bio', '')
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_hosai ON auth.users;
CREATE TRIGGER on_auth_user_created_hosai
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_hosai_user();
