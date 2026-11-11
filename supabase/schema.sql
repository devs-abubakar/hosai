-- ==============================================================================
-- HOSAI Healthcare Platform - PostgreSQL Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM ENUMS
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe', 'life_threatening');
CREATE TYPE condition_status AS ENUM ('active', 'managed', 'in_remission', 'resolved');
CREATE TYPE medication_status AS ENUM ('active', 'completed', 'discontinued');
CREATE TYPE record_type AS ENUM ('lab_report', 'prescription', 'imaging_xray', 'discharge_summary', 'vaccination', 'other');
CREATE TYPE doctor_verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE access_status AS ENUM ('active', 'revoked', 'pending', 'rejected');
CREATE TYPE access_requested_by AS ENUM ('doctor', 'patient');

-- 3. CORE USER PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'patient',
    avatar_url TEXT,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PATIENT PROFILES
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    blood_group blood_group NOT NULL,
    gender gender_type NOT NULL DEFAULT 'prefer_not_to_say',
    emergency_contact_name TEXT NOT NULL,
    emergency_contact_phone TEXT NOT NULL,
    emergency_contact_relation TEXT NOT NULL,
    insurance_provider TEXT,
    insurance_policy_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. DOCTOR PROFILES
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    qualifications TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    registration_number TEXT UNIQUE NOT NULL,
    verification_status doctor_verification_status NOT NULL DEFAULT 'pending',
    bio TEXT,
    consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. HOSPITALS
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    emergency_helpline TEXT NOT NULL,
    departments TEXT[] NOT NULL DEFAULT '{}',
    services TEXT[] NOT NULL DEFAULT '{}',
    rating NUMERIC(3,2) DEFAULT 4.8,
    is_verified BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. DOCTOR-HOSPITAL AFFILIATIONS
CREATE TABLE IF NOT EXISTS doctor_hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    visiting_hours TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    UNIQUE(doctor_id, hospital_id)
);

-- 8. PATIENT-DOCTOR ACCESS AUTHORIZATION & REQUEST PIPELINE
CREATE TABLE IF NOT EXISTS patient_doctor_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_status access_status NOT NULL DEFAULT 'active',
    requested_by access_requested_by NOT NULL DEFAULT 'patient',
    request_note TEXT,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(patient_id, doctor_id)
);

-- 9. MEDICAL CONDITIONS
CREATE TABLE IF NOT EXISTS medical_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    disease_name TEXT NOT NULL,
    description TEXT,
    status condition_status NOT NULL DEFAULT 'active',
    diagnosed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. ALLERGIES
CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    allergen TEXT NOT NULL,
    reaction TEXT NOT NULL,
    severity allergy_severity NOT NULL DEFAULT 'moderate',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. MEDICATIONS
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT,
    status medication_status NOT NULL DEFAULT 'active',
    prescribed_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. MEDICAL RECORDS (DOCUMENTS, X-RAYS, LAB REPORTS)
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    record_type record_type NOT NULL,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CONSULTATIONS
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consultation_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    symptoms TEXT NOT NULL,
    observations TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    clinical_notes TEXT,
    treatment_plan TEXT NOT NULL,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. PRESCRIPTIONS
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    general_instructions TEXT,
    is_dispensed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PRESCRIPTION ITEMS
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_doctor_spec ON doctor_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_verify ON doctor_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_med_conditions_patient ON medical_conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_allergies_patient ON allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_access_patient_doctor ON patient_doctor_access(patient_id, doctor_id, access_status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_doctor_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user an Admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Helper function: Does doctor have authorized access to patient?
CREATE OR REPLACE FUNCTION has_doctor_access(target_patient_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM patient_doctor_access a
        JOIN doctor_profiles d ON d.id = a.doctor_id
        JOIN profiles p ON p.id = d.id
        WHERE doctor_id = auth.uid()
          AND a.patient_id = target_patient_id
          AND a.access_status = 'active'
          AND d.verification_status = 'verified'
          AND p.role = 'doctor'
          AND (a.expires_at IS NULL OR a.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Replace permissive prototype policies with authorization that is enforced by Postgres.
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Patient profile access control" ON patient_profiles;
DROP POLICY IF EXISTS "Patients insert/update own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Doctor profiles are readable by all authenticated users" ON doctor_profiles;
DROP POLICY IF EXISTS "Doctors can update own profile" ON doctor_profiles;
DROP POLICY IF EXISTS "View access requests" ON patient_doctor_access;
DROP POLICY IF EXISTS "Doctors or patients initiate access requests" ON patient_doctor_access;
DROP POLICY IF EXISTS "Patients manage or update access status" ON patient_doctor_access;
DROP POLICY IF EXISTS "Read medical records" ON medical_records;
DROP POLICY IF EXISTS "Insert medical records" ON medical_records;
DROP POLICY IF EXISTS "Read conditions" ON medical_conditions;
DROP POLICY IF EXISTS "Manage conditions" ON medical_conditions;
DROP POLICY IF EXISTS "Read allergies" ON allergies;
DROP POLICY IF EXISTS "Manage allergies" ON allergies;
DROP POLICY IF EXISTS "Read medications" ON medications;
DROP POLICY IF EXISTS "Manage medications" ON medications;
DROP POLICY IF EXISTS "Read consultations" ON consultations;
DROP POLICY IF EXISTS "Doctors insert consultations" ON consultations;
DROP POLICY IF EXISTS "Read prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors insert prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Read prescription items" ON prescription_items;

CREATE POLICY "Users read own or discoverable profiles" ON profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR role = 'doctor' OR EXISTS (
    SELECT 1 FROM patient_doctor_access a
    WHERE a.patient_id = profiles.id AND a.doctor_id = auth.uid()
));
CREATE POLICY "Users update own profile without changing role" ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND role = current_user_role());

CREATE POLICY "Patient profile access control" ON patient_profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR has_doctor_access(id));
CREATE POLICY "Patients manage own profile" ON patient_profiles FOR ALL TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Doctor profiles are discoverable" ON doctor_profiles FOR SELECT TO authenticated
USING (true);
CREATE POLICY "Doctors update own professional profile" ON doctor_profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins verify doctors" ON doctor_profiles FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Participants read access requests" ON patient_doctor_access FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid());
CREATE POLICY "Patient grants or doctor requests access" ON patient_doctor_access FOR INSERT TO authenticated
WITH CHECK (
    (patient_id = auth.uid() AND requested_by = 'patient' AND access_status = 'active') OR
    (doctor_id = auth.uid() AND requested_by = 'doctor' AND access_status = 'pending'
      AND EXISTS (SELECT 1 FROM doctor_profiles d WHERE d.id = auth.uid() AND d.verification_status = 'verified'))
);
CREATE POLICY "Patient controls access status" ON patient_doctor_access FOR UPDATE TO authenticated
USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patient revokes access" ON patient_doctor_access FOR DELETE TO authenticated
USING (patient_id = auth.uid());

CREATE POLICY "Read authorized medical records" ON medical_records FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id));
CREATE POLICY "Insert authorized medical records" ON medical_records FOR INSERT TO authenticated
WITH CHECK (
    (patient_id = auth.uid() AND uploaded_by = auth.uid()) OR
    (uploaded_by = auth.uid() AND has_doctor_access(patient_id))
);
CREATE POLICY "Patients delete own medical records" ON medical_records FOR DELETE TO authenticated
USING (patient_id = auth.uid());

CREATE POLICY "Read authorized conditions" ON medical_conditions FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id));
CREATE POLICY "Patients manage own conditions" ON medical_conditions FOR ALL TO authenticated
USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Read authorized allergies" ON allergies FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id));
CREATE POLICY "Patients manage own allergies" ON allergies FOR ALL TO authenticated
USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Read authorized medications" ON medications FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id));
CREATE POLICY "Manage medications with authorization" ON medications FOR ALL TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id))
WITH CHECK (patient_id = auth.uid() OR has_doctor_access(patient_id));

CREATE POLICY "Read authorized consultations" ON consultations FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR (doctor_id = auth.uid() AND has_doctor_access(patient_id)));
CREATE POLICY "Verified authorized doctors write consultations" ON consultations FOR INSERT TO authenticated
WITH CHECK (doctor_id = auth.uid() AND has_doctor_access(patient_id));
CREATE POLICY "Read authorized prescriptions" ON prescriptions FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR (doctor_id = auth.uid() AND has_doctor_access(patient_id)));
CREATE POLICY "Verified authorized doctors write prescriptions" ON prescriptions FOR INSERT TO authenticated
WITH CHECK (doctor_id = auth.uid() AND has_doctor_access(patient_id) AND EXISTS (
    SELECT 1 FROM consultations c WHERE c.id = consultation_id
      AND c.patient_id = patient_id AND c.doctor_id = auth.uid()
));
CREATE POLICY "Read authorized prescription items" ON prescription_items FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM prescriptions p WHERE p.id = prescription_id
  AND (p.patient_id = auth.uid() OR (p.doctor_id = auth.uid() AND has_doctor_access(p.patient_id)))));
CREATE POLICY "Doctors write authorized prescription items" ON prescription_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM prescriptions p WHERE p.id = prescription_id
  AND p.doctor_id = auth.uid() AND has_doctor_access(p.patient_id)));

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
ON profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Patient Profiles Policies:
-- Doctors cannot read patient medical demographics unless they have active access or are an admin.
CREATE POLICY "Patient profile access control"
ON patient_profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR has_doctor_access(id) OR is_admin());

CREATE POLICY "Patients insert/update own profile"
ON patient_profiles FOR ALL TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Doctor Profiles Policies
CREATE POLICY "Doctor profiles are readable by all authenticated users"
ON doctor_profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Doctors can update own profile"
ON doctor_profiles FOR UPDATE TO authenticated
USING (auth.uid() = id OR is_admin());

-- Patient-Doctor Access Requests & Permissions Policies
CREATE POLICY "View access requests"
ON patient_doctor_access FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR is_admin());

CREATE POLICY "Doctors or patients initiate access requests"
ON patient_doctor_access FOR INSERT TO authenticated
WITH CHECK (patient_id = auth.uid() OR doctor_id = auth.uid());

CREATE POLICY "Patients manage or update access status"
ON patient_doctor_access FOR UPDATE TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR is_admin());

-- Medical Records Policies
CREATE POLICY "Read medical records"
ON medical_records FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id) OR is_admin());

CREATE POLICY "Insert medical records"
ON medical_records FOR INSERT TO authenticated
WITH CHECK (patient_id = auth.uid() OR has_doctor_access(patient_id) OR is_admin());

-- Medical Conditions, Allergies, Medications Policies
CREATE POLICY "Read conditions"
ON medical_conditions FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id) OR is_admin());

CREATE POLICY "Manage conditions"
ON medical_conditions FOR ALL TO authenticated
USING (patient_id = auth.uid() OR is_admin());

CREATE POLICY "Read allergies"
ON allergies FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id) OR is_admin());

CREATE POLICY "Manage allergies"
ON allergies FOR ALL TO authenticated
USING (patient_id = auth.uid() OR is_admin());

CREATE POLICY "Read medications"
ON medications FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id) OR is_admin());

CREATE POLICY "Manage medications"
ON medications FOR ALL TO authenticated
USING (patient_id = auth.uid() OR has_doctor_access(patient_id) OR is_admin());

-- Consultations Policies
CREATE POLICY "Read consultations"
ON consultations FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR is_admin());

CREATE POLICY "Doctors insert consultations"
ON consultations FOR INSERT TO authenticated
WITH CHECK (doctor_id = auth.uid() AND (has_doctor_access(patient_id) OR is_admin()));

-- Prescriptions Policies
CREATE POLICY "Read prescriptions"
ON prescriptions FOR SELECT TO authenticated
USING (patient_id = auth.uid() OR doctor_id = auth.uid() OR is_admin());

CREATE POLICY "Doctors insert prescriptions"
ON prescriptions FOR INSERT TO authenticated
WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Read prescription items"
ON prescription_items FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM prescriptions p
    WHERE p.id = prescription_id
      AND (p.patient_id = auth.uid() OR p.doctor_id = auth.uid() OR is_admin())
));

-- Hospitals Policies
CREATE POLICY "Hospitals readable by all"
ON hospitals FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins manage hospitals"
ON hospitals FOR ALL TO authenticated
USING (is_admin());
