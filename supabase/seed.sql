-- ==============================================================================
-- HOSAI Healthcare Platform - Demo Seed Data
-- ==============================================================================

-- 1. HOSPITALS
INSERT INTO hospitals (id, name, address, city, state, contact_phone, contact_email, emergency_helpline, departments, services, rating, is_verified)
VALUES
('h1111111-1111-1111-1111-111111111111', 'Metro Health Medical Center', '742 Evergreen Terrace', 'New York', 'NY', '+1 (212) 555-0199', 'care@metrohealth.org', '+1 (212) 555-9111', 
 ARRAY['Cardiology', 'Emergency Medicine', 'Neurology', 'Internal Medicine', 'Radiology'], 
 ARRAY['24/7 Level 1 Trauma', 'Cardiac Cath Lab', '3T MRI', 'Intensive Care Unit (ICU)', 'Outpatient Pharmacy'], 4.9, true),

('h2222222-2222-2222-2222-222222222222', 'Saint Jude Memorial Hospital', '450 Sutter Health Ave', 'San Francisco', 'CA', '+1 (415) 555-0144', 'contact@stjudememorial.org', '+1 (415) 555-9999', 
 ARRAY['Oncology', 'Pediatrics', 'Orthopedics', 'General Surgery', 'Cardiology'], 
 ARRAY['Robotic Surgery Suite', 'PET-CT Imaging', 'Pediatric ICU', 'Comprehensive Cancer Care'], 4.8, true),

('h3333333-3333-3333-3333-333333333333', 'Bellevue Central Care Clinic', '820 Michigan Avenue', 'Chicago', 'IL', '+1 (312) 555-0182', 'info@bellevuecare.org', '+1 (312) 555-0911', 
 ARRAY['Family Medicine', 'Dermatology', 'Endocrinology', 'Physical Therapy'], 
 ARRAY['Same-day Diagnostic Lab', 'Digital X-Ray', 'Telehealth Hub', 'Minor Surgery'], 4.7, true)
ON CONFLICT (id) DO NOTHING;

-- 2. USER PROFILES
-- Note: In Supabase, profiles.id matches auth.users.id
INSERT INTO profiles (id, email, username, full_name, phone, role, avatar_url, location)
VALUES
('d1111111-1111-1111-1111-111111111111', 'sarah@hosai.health', 'sarah_jenkins', 'Sarah Jenkins', '+1 (555) 234-5678', 'patient', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'New York, NY'),
('d2222222-2222-2222-2222-222222222222', 'robert@hosai.health', 'robert_chen', 'Robert Chen', '+1 (555) 876-5432', 'patient', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Brooklyn, NY'),
('d3333333-3333-3333-3333-333333333333', 'marcus.vance@hosai.health', 'dr_vance', 'Dr. Marcus Vance', '+1 (555) 345-6789', 'doctor', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', 'New York, NY'),
('d4444444-4444-4444-4444-444444444444', 'priya.sharma@hosai.health', 'dr_sharma', 'Dr. Priya Sharma', '+1 (555) 456-7890', 'doctor', 'https://images.unsplash.com/photo-1594824813583-05708892ec0f?w=150', 'San Francisco, CA'),
('d5555555-5555-5555-5555-555555555555', 'james.wilson@hosai.health', 'dr_wilson', 'Dr. James Wilson', '+1 (555) 567-8901', 'doctor', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150', 'Chicago, IL'),
('d6666666-6666-6666-6666-666666666666', 'admin@hosai.health', 'admin_elena', 'Elena Rostova', '+1 (555) 999-0000', 'admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Boston, MA')
ON CONFLICT (id) DO NOTHING;

-- 3. PATIENT PROFILES
INSERT INTO patient_profiles (id, date_of_birth, blood_group, gender, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, insurance_provider, insurance_policy_number)
VALUES
('d1111111-1111-1111-1111-111111111111', '1992-06-14', 'O+', 'female', 'Michael Jenkins', '+1 (555) 234-9999', 'Spouse', 'BlueCross BlueShield Premier', 'BCBS-8492031-NY'),
('d2222222-2222-2222-2222-222222222222', '1985-03-22', 'A+', 'male', 'Linda Chen', '+1 (555) 876-1111', 'Sister', 'Aetna Health Plus', 'AET-992144-NY')
ON CONFLICT (id) DO NOTHING;

-- 4. DOCTOR PROFILES
INSERT INTO doctor_profiles (id, specialization, qualifications, experience_years, registration_number, verification_status, bio, consultation_fee)
VALUES
('d3333333-3333-3333-3333-333333333333', 'Cardiology', ARRAY['MBBS', 'MD (Cardiology)', 'FACC', 'Board Certified Cardiologist'], 14, 'MED-NY-84920', 'verified', 'Senior Cardiologist specializing in preventative cardiology, hypertension management, and echocardiography.', 175.00),
('d4444444-4444-4444-4444-444444444444', 'Neurology', ARRAY['MD', 'DM Neurology', 'FAAN'], 9, 'MED-CA-39121', 'verified', 'Consultant Neurologist focusing on neuro-vascular disorders, chronic migraine therapy, and cognitive health.', 190.00),
('d5555555-5555-5555-5555-555555555555', 'Family Medicine', ARRAY['MBBS', 'Residency in Internal Medicine'], 4, 'MED-IL-99214', 'pending', 'Passionate family physician committed to holistic preventative care and chronic disease management.', 95.00)
ON CONFLICT (id) DO NOTHING;

-- 5. DOCTOR-HOSPITAL AFFILIATIONS
INSERT INTO doctor_hospitals (doctor_id, hospital_id, visiting_hours, is_primary)
VALUES
('d3333333-3333-3333-3333-333333333333', 'h1111111-1111-1111-1111-111111111111', 'Mon, Wed, Fri 09:00 - 15:00', true),
('d4444444-4444-4444-4444-444444444444', 'h2222222-2222-2222-2222-222222222222', 'Tue, Thu 10:00 - 16:00', true),
('d5555555-5555-5555-5555-555555555555', 'h3333333-3333-3333-3333-333333333333', 'Mon-Fri 08:30 - 17:00', true)
ON CONFLICT (doctor_id, hospital_id) DO NOTHING;

-- 6. PATIENT-DOCTOR ACCESS
-- Sarah Jenkins has active authorized relationship with Dr. Marcus Vance
INSERT INTO patient_doctor_access (id, patient_id, doctor_id, access_status, requested_by, granted_at)
VALUES
('acc-1', 'd1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'active', 'patient', NOW() - INTERVAL '30 days')
ON CONFLICT (patient_id, doctor_id) DO NOTHING;

-- 7. ALLERGIES
INSERT INTO allergies (patient_id, allergen, reaction, severity, notes)
VALUES
('d1111111-1111-1111-1111-111111111111', 'Penicillin', 'Anaphylactic reaction with acute urticaria and dyspnea', 'severe', 'Strictly avoid all Beta-lactam antibiotics. Keep EpiPen available.'),
('d1111111-1111-1111-1111-111111111111', 'Peanuts', 'Facial swelling and gastrointestinal cramping', 'moderate', 'Diagnosed via IgE skin prick test in 2018.'),
('d1111111-1111-1111-1111-111111111111', 'Latex', 'Contact erythema and localized dermatitis', 'mild', 'Advise nitrile or synthetic exam gloves.'),
('d2222222-2222-2222-2222-222222222222', 'Shellfish', 'Oral angioedema and nausea', 'moderate', 'Avoid crustaceans and mollusks.');

-- 8. MEDICAL CONDITIONS
INSERT INTO medical_conditions (patient_id, disease_name, description, status, diagnosed_date)
VALUES
('d1111111-1111-1111-1111-111111111111', 'Essential Hypertension', 'Stage 1 primary hypertension, responding well to ACE inhibitors and sodium restriction', 'managed', '2023-02-15'),
('d1111111-1111-1111-1111-111111111111', 'Mild Mitral Valve Regurgitation', 'Trace to mild systolic murmur noted during physical exam; verified by echocardiogram', 'active', '2024-04-10'),
('d2222222-2222-2222-2222-222222222222', 'Type 2 Diabetes Mellitus', 'Non-insulin dependent, maintained on oral hypoglycemic agents and lifestyle modification', 'managed', '2022-09-10');

-- 9. MEDICATIONS
INSERT INTO medications (patient_id, medication_name, dosage, frequency, duration, status, prescribed_by)
VALUES
('d1111111-1111-1111-1111-111111111111', 'Lisinopril', '10 mg', 'Once daily with morning water', 'Ongoing', 'active', 'Dr. Marcus Vance'),
('d1111111-1111-1111-1111-111111111111', 'Atorvastatin', '20 mg', 'Once daily at bedtime', 'Ongoing', 'active', 'Dr. Marcus Vance'),
('d2222222-2222-2222-2222-222222222222', 'Metformin HCl', '500 mg', 'Twice daily with meals', 'Ongoing', 'active', 'Primary Care Physician');

-- 10. MEDICAL RECORDS
INSERT INTO medical_records (patient_id, uploaded_by, title, record_type, record_date, file_url, file_size_bytes, file_name, notes)
VALUES
('d1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Transthoracic Echocardiogram Report', 'imaging_xray', CURRENT_DATE - INTERVAL '60 days', '/docs/echocardiogram-2026.pdf', 2411724, 'ECHO_Doppler_SarahJenkins.pdf', 'Normal EF 62%. Trace mitral regurgitation. No LV hypertrophy.'),
('d1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Comprehensive Metabolic & Lipid Panel', 'lab_report', CURRENT_DATE - INTERVAL '15 days', '/docs/lipid-panel-march2026.pdf', 1048576, 'Quest_Lipids_CMP_Report.pdf', 'Total Cholesterol 192 mg/dL, LDL 112 mg/dL, Fasting Glucose 94 mg/dL.'),
('d1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', '12-Lead Electrocardiogram (ECG)', 'imaging_xray', CURRENT_DATE - INTERVAL '15 days', '/docs/ecg-12lead-march2026.pdf', 850230, 'ECG_12Lead_SinusRhythm.pdf', 'Normal sinus rhythm, heart rate 68 bpm. PR interval 158 ms. No ischemic changes.'),
('d2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Glycated Hemoglobin (HbA1c) Lab Report', 'lab_report', CURRENT_DATE - INTERVAL '20 days', '/docs/hba1c-report.pdf', 940120, 'LabCorp_HbA1c_Panel.pdf', 'HbA1c 6.4%, Estimated Average Glucose 137 mg/dL. Stable glycemic control.');

-- 11. CONSULTATIONS & PRESCRIPTIONS
WITH ins_consultation AS (
    INSERT INTO consultations (id, patient_id, doctor_id, consultation_date, symptoms, observations, diagnosis, clinical_notes, treatment_plan, follow_up_date)
    VALUES (
        'c1111111-1111-1111-1111-111111111111',
        'd1111111-1111-1111-1111-111111111111',
        'd3333333-3333-3333-3333-333333333333',
        NOW() - INTERVAL '14 days',
        'Mild exertion dyspnea after climbing 3 flights of stairs, occasional morning headaches.',
        'BP: 128/82 mmHg, HR: 70 bpm regular, SpO2: 99% on room air. S1/S2 heard, faint soft systolic click at apex.',
        'Well-managed Essential Hypertension with Trace Mitral Valve Regurgitation',
        'Patient reports high adherence to Lisinopril. Sodium intake moderate. Dietary counseling provided.',
        'Continue Lisinopril 10mg daily. Aerobic exercise 30 mins 4x/week. Repeat lipid profile in 6 months.',
        CURRENT_DATE + INTERVAL '90 days'
    )
    RETURNING id
),
ins_prescription AS (
    INSERT INTO prescriptions (id, consultation_id, patient_id, doctor_id, prescription_date, general_instructions)
    SELECT 
        'p1111111-1111-1111-1111-111111111111',
        id,
        'd1111111-1111-1111-1111-111111111111',
        'd3333333-3333-3333-3333-333333333333',
        CURRENT_DATE - INTERVAL '14 days',
        'Take medications with morning meal. Monitor resting blood pressure twice weekly in the log.'
    FROM ins_consultation
    RETURNING id
)
INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
SELECT 
    id,
    'Lisinopril',
    '10 mg',
    'Once daily (morning)',
    '90 days',
    'Take with full glass of water. Report dry cough if persistent.'
FROM ins_prescription
UNION ALL
SELECT 
    id,
    'Atorvastatin Calcium',
    '20 mg',
    'Once daily (night)',
    '90 days',
    'Take after dinner. Avoid grapefruit juice.'
FROM ins_prescription;
