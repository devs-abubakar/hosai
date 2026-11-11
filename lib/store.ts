'use client';

import { useState, useEffect } from 'react';
import {
  UserProfile,
  PatientProfile,
  DoctorProfile,
  Hospital,
  DoctorHospital,
  PatientDoctorAccess,
  MedicalCondition,
  Allergy,
  Medication,
  MedicalRecord,
  Consultation,
  Prescription,
  PrescriptionItem,
  UserRole,
} from '@/types/database';

export interface HosaiState {
  authenticatedUserId: string | null;
  profiles: UserProfile[];
  patientProfiles: PatientProfile[];
  doctorProfiles: DoctorProfile[];
  hospitals: Hospital[];
  doctorHospitals: DoctorHospital[];
  patientDoctorAccess: PatientDoctorAccess[];
  medicalConditions: MedicalCondition[];
  allergies: Allergy[];
  medications: Medication[];
  medicalRecords: MedicalRecord[];
  consultations: Consultation[];
  prescriptions: Prescription[];
}

export const DEMO_PASSWORD = 'Password123!';
export const DEMO_ADMIN_PASSWORD = 'AdminPassword123!';

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    email: 'sarah@hosai.health',
    username: 'sarah_jenkins',
    password: DEMO_PASSWORD,
    full_name: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    role: 'patient',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    location: 'New York, NY',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2026-02-10T14:30:00Z',
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    email: 'robert@hosai.health',
    username: 'robert_chen',
    password: DEMO_PASSWORD,
    full_name: 'Robert Chen',
    phone: '+1 (555) 876-5432',
    role: 'patient',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    location: 'Brooklyn, NY',
    created_at: '2025-04-12T10:00:00Z',
    updated_at: '2026-01-20T11:00:00Z',
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    email: 'marcus.vance@hosai.health',
    username: 'dr_vance',
    password: DEMO_PASSWORD,
    full_name: 'Dr. Marcus Vance',
    phone: '+1 (555) 345-6789',
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150',
    location: 'New York, NY',
    created_at: '2024-11-01T08:00:00Z',
    updated_at: '2026-02-01T16:00:00Z',
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    email: 'priya.sharma@hosai.health',
    username: 'dr_sharma',
    password: DEMO_PASSWORD,
    full_name: 'Dr. Priya Sharma',
    phone: '+1 (555) 456-7890',
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1594824813583-05708892ec0f?w=150',
    location: 'San Francisco, CA',
    created_at: '2024-12-10T09:30:00Z',
    updated_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    email: 'james.wilson@hosai.health',
    username: 'dr_wilson',
    password: DEMO_PASSWORD,
    full_name: 'Dr. James Wilson',
    phone: '+1 (555) 567-8901',
    role: 'doctor',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150',
    location: 'Chicago, IL',
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-28T10:00:00Z',
  },
  {
    id: 'd6666666-6666-6666-6666-666666666666',
    email: 'admin@hosai.health',
    username: 'admin_elena',
    password: DEMO_ADMIN_PASSWORD,
    full_name: 'Elena Rostova',
    phone: '+1 (555) 999-0000',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    location: 'Boston, MA',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_PATIENT_PROFILES: PatientProfile[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    date_of_birth: '1992-06-14',
    blood_group: 'O+',
    gender: 'female',
    emergency_contact_name: 'Michael Jenkins',
    emergency_contact_phone: '+1 (555) 234-9999',
    emergency_contact_relation: 'Spouse',
    insurance_provider: 'BlueCross BlueShield Premier',
    insurance_policy_number: 'BCBS-8492031-NY',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2026-02-10T14:30:00Z',
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    date_of_birth: '1985-03-22',
    blood_group: 'A+',
    gender: 'male',
    emergency_contact_name: 'Linda Chen',
    emergency_contact_phone: '+1 (555) 876-1111',
    emergency_contact_relation: 'Sister',
    insurance_provider: 'Aetna Health Plus',
    insurance_policy_number: 'AET-992144-NY',
    created_at: '2025-04-12T10:00:00Z',
    updated_at: '2026-01-20T11:00:00Z',
  },
];

const INITIAL_DOCTOR_PROFILES: DoctorProfile[] = [
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD (Cardiology)', 'FACC', 'Board Certified Cardiologist'],
    experience_years: 14,
    registration_number: 'MED-NY-84920',
    verification_status: 'verified',
    bio: 'Senior Cardiologist specializing in preventative cardiology, hypertension management, and echocardiography.',
    consultation_fee: 175.00,
    created_at: '2024-11-01T08:00:00Z',
    updated_at: '2026-02-01T16:00:00Z',
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    specialization: 'Neurology',
    qualifications: ['MD', 'DM Neurology', 'FAAN'],
    experience_years: 9,
    registration_number: 'MED-CA-39121',
    verification_status: 'verified',
    bio: 'Consultant Neurologist focusing on neuro-vascular disorders, chronic migraine therapy, and cognitive health.',
    consultation_fee: 190.00,
    created_at: '2024-12-10T09:30:00Z',
    updated_at: '2026-01-15T12:00:00Z',
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    specialization: 'Family Medicine',
    qualifications: ['MBBS', 'Residency in Internal Medicine'],
    experience_years: 4,
    registration_number: 'MED-IL-99214',
    verification_status: 'pending',
    bio: 'Passionate family physician committed to holistic preventative care and chronic disease management.',
    consultation_fee: 95.00,
    created_at: '2026-02-01T08:00:00Z',
    updated_at: '2026-02-28T10:00:00Z',
  },
];

const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'h1111111-1111-1111-1111-111111111111',
    name: 'Metro Health Medical Center',
    address: '742 Evergreen Terrace',
    city: 'New York',
    state: 'NY',
    contact_phone: '+1 (212) 555-0199',
    contact_email: 'care@metrohealth.org',
    emergency_helpline: '+1 (212) 555-9111',
    departments: ['Cardiology', 'Emergency Medicine', 'Neurology', 'Internal Medicine', 'Radiology'],
    services: ['24/7 Level 1 Trauma', 'Cardiac Cath Lab', '3T MRI', 'Intensive Care Unit (ICU)', 'Outpatient Pharmacy'],
    rating: 4.9,
    is_verified: true,
    image_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'h2222222-2222-2222-2222-222222222222',
    name: 'Saint Jude Memorial Hospital',
    address: '450 Sutter Health Ave',
    city: 'San Francisco',
    state: 'CA',
    contact_phone: '+1 (415) 555-0144',
    contact_email: 'contact@stjudememorial.org',
    emergency_helpline: '+1 (415) 555-9999',
    departments: ['Oncology', 'Pediatrics', 'Orthopedics', 'General Surgery', 'Cardiology'],
    services: ['Robotic Surgery Suite', 'PET-CT Imaging', 'Pediatric ICU', 'Comprehensive Cancer Care'],
    rating: 4.8,
    is_verified: true,
    image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'h3333333-3333-3333-3333-333333333333',
    name: 'Bellevue Central Care Clinic',
    address: '820 Michigan Avenue',
    city: 'Chicago',
    state: 'IL',
    contact_phone: '+1 (312) 555-0182',
    contact_email: 'info@bellevuecare.org',
    emergency_helpline: '+1 (312) 555-0911',
    departments: ['Family Medicine', 'Dermatology', 'Endocrinology', 'Physical Therapy'],
    services: ['Same-day Diagnostic Lab', 'Digital X-Ray', 'Telehealth Hub', 'Minor Surgery'],
    rating: 4.7,
    is_verified: true,
    image_url: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const INITIAL_DOCTOR_HOSPITALS: DoctorHospital[] = [
  {
    id: 'dh-1',
    doctor_id: 'd3333333-3333-3333-3333-333333333333',
    hospital_id: 'h1111111-1111-1111-1111-111111111111',
    visiting_hours: 'Mon, Wed, Fri 09:00 - 15:00',
    is_primary: true,
  },
  {
    id: 'dh-2',
    doctor_id: 'd4444444-4444-4444-4444-444444444444',
    hospital_id: 'h2222222-2222-2222-2222-222222222222',
    visiting_hours: 'Tue, Thu 10:00 - 16:00',
    is_primary: true,
  },
  {
    id: 'dh-3',
    doctor_id: 'd5555555-5555-5555-5555-555555555555',
    hospital_id: 'h3333333-3333-3333-3333-333333333333',
    visiting_hours: 'Mon-Fri 08:30 - 17:00',
    is_primary: true,
  },
];

// Note: Dr. Vance is authorized for Sarah Jenkins. Robert Chen has NO active authorization initially.
const INITIAL_ACCESS: PatientDoctorAccess[] = [
  {
    id: 'acc-1',
    patient_id: 'd1111111-1111-1111-1111-111111111111', // Sarah Jenkins
    doctor_id: 'd3333333-3333-3333-3333-333333333333', // Dr. Marcus Vance
    access_status: 'active',
    requested_by: 'patient',
    granted_at: '2026-01-10T10:00:00Z',
  },
];

const INITIAL_ALLERGIES: Allergy[] = [
  {
    id: 'alg-1',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    allergen: 'Penicillin',
    reaction: 'Anaphylactic reaction with acute urticaria and dyspnea',
    severity: 'severe',
    notes: 'Strictly avoid all Beta-lactam antibiotics. Keep EpiPen available.',
    created_at: '2025-01-20T10:00:00Z',
  },
  {
    id: 'alg-2',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    allergen: 'Peanuts',
    reaction: 'Facial swelling and gastrointestinal cramping',
    severity: 'moderate',
    notes: 'Diagnosed via IgE skin prick test in 2018.',
    created_at: '2025-01-20T10:05:00Z',
  },
  {
    id: 'alg-3',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    allergen: 'Latex',
    reaction: 'Contact erythema and localized dermatitis',
    severity: 'mild',
    notes: 'Advise nitrile or synthetic exam gloves.',
    created_at: '2025-02-15T11:00:00Z',
  },
  {
    id: 'alg-4',
    patient_id: 'd2222222-2222-2222-2222-222222222222',
    allergen: 'Shellfish',
    reaction: 'Oral angioedema and nausea',
    severity: 'moderate',
    notes: 'Avoid crustaceans and mollusks.',
    created_at: '2025-03-01T10:00:00Z',
  },
];

const INITIAL_CONDITIONS: MedicalCondition[] = [
  {
    id: 'cnd-1',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    disease_name: 'Essential Hypertension',
    description: 'Stage 1 primary hypertension, responding well to ACE inhibitors and sodium restriction',
    status: 'managed',
    diagnosed_date: '2023-02-15',
    created_at: '2025-01-15T09:00:00Z',
  },
  {
    id: 'cnd-2',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    disease_name: 'Mild Mitral Valve Regurgitation',
    description: 'Trace to mild systolic murmur noted during physical exam; verified by echocardiogram',
    status: 'active',
    diagnosed_date: '2024-04-10',
    created_at: '2025-01-15T09:15:00Z',
  },
  {
    id: 'cnd-3',
    patient_id: 'd2222222-2222-2222-2222-222222222222',
    disease_name: 'Type 2 Diabetes Mellitus',
    description: 'Non-insulin dependent, maintained on oral hypoglycemic agents and lifestyle modification',
    status: 'managed',
    diagnosed_date: '2022-09-10',
    created_at: '2025-01-10T10:00:00Z',
  },
];

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    medication_name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily (morning)',
    duration: 'Ongoing',
    status: 'active',
    prescribed_by: 'Dr. Marcus Vance',
    created_at: '2025-01-20T14:00:00Z',
  },
  {
    id: 'med-2',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    medication_name: 'Atorvastatin Calcium',
    dosage: '20 mg',
    frequency: 'Once daily at bedtime',
    duration: 'Ongoing',
    status: 'active',
    prescribed_by: 'Dr. Marcus Vance',
    created_at: '2025-01-20T14:15:00Z',
  },
  {
    id: 'med-3',
    patient_id: 'd2222222-2222-2222-2222-222222222222',
    medication_name: 'Metformin HCl',
    dosage: '500 mg',
    frequency: 'Twice daily with meals',
    duration: 'Ongoing',
    status: 'active',
    prescribed_by: 'Primary Care Physician',
    created_at: '2025-01-12T10:00:00Z',
  },
];

const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    uploaded_by: 'd1111111-1111-1111-1111-111111111111',
    title: 'Transthoracic Echocardiogram Report',
    record_type: 'imaging_xray',
    record_date: '2026-01-10',
    file_url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico',
    file_name: 'ECHO_Doppler_SarahJenkins.pdf',
    file_size_bytes: 2411724,
    notes: 'Normal EF 62%. Trace mitral regurgitation. No LV hypertrophy. Good diastolic function.',
    created_at: '2026-01-10T12:00:00Z',
  },
  {
    id: 'rec-2',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    uploaded_by: 'd1111111-1111-1111-1111-111111111111',
    title: 'Comprehensive Metabolic & Lipid Panel',
    record_type: 'lab_report',
    record_date: '2026-02-24',
    file_url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico',
    file_name: 'Quest_Lipids_CMP_Report.pdf',
    file_size_bytes: 1048576,
    notes: 'Total Cholesterol 192 mg/dL, LDL 112 mg/dL, HDL 54 mg/dL, Fasting Glucose 94 mg/dL. Creatinine 0.9 mg/dL (Normal).',
    created_at: '2026-02-24T15:30:00Z',
  },
  {
    id: 'rec-3',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    uploaded_by: 'd1111111-1111-1111-1111-111111111111',
    title: '12-Lead Electrocardiogram (ECG)',
    record_type: 'imaging_xray',
    record_date: '2026-02-24',
    file_url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico',
    file_name: 'ECG_12Lead_SinusRhythm.pdf',
    file_size_bytes: 850230,
    notes: 'Normal sinus rhythm, heart rate 68 bpm. PR interval 158 ms. QRS axis normal. No ischemic ST segment elevation.',
    created_at: '2026-02-24T16:00:00Z',
  },
  {
    id: 'rec-4',
    patient_id: 'd2222222-2222-2222-2222-222222222222',
    uploaded_by: 'd2222222-2222-2222-2222-222222222222',
    title: 'Glycated Hemoglobin (HbA1c) Lab Report',
    record_type: 'lab_report',
    record_date: '2026-02-10',
    file_url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico',
    file_name: 'LabCorp_HbA1c_Panel.pdf',
    file_size_bytes: 940120,
    notes: 'HbA1c 6.4%, Estimated Average Glucose 137 mg/dL. Stable glycemic control on Metformin.',
    created_at: '2026-02-10T11:00:00Z',
  },
];

const INITIAL_PRESCRIPTION_ITEMS: PrescriptionItem[] = [
  {
    id: 'item-1',
    prescription_id: 'presc-1',
    medicine_name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily (morning)',
    duration: '90 days',
    instructions: 'Take with full glass of water. Report dry cough if persistent.',
  },
  {
    id: 'item-2',
    prescription_id: 'presc-1',
    medicine_name: 'Atorvastatin Calcium',
    dosage: '20 mg',
    frequency: 'Once daily (bedtime)',
    duration: '90 days',
    instructions: 'Take after dinner. Avoid grapefruit and excessive alcohol.',
  },
];

const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'presc-1',
    consultation_id: 'cons-1',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    doctor_id: 'd3333333-3333-3333-3333-333333333333',
    prescription_date: '2026-02-24',
    general_instructions: 'Take medications with morning meal. Monitor resting blood pressure twice weekly in the patient log.',
    is_dispensed: false,
    created_at: '2026-02-24T16:30:00Z',
    items: INITIAL_PRESCRIPTION_ITEMS,
  },
];

const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'cons-1',
    patient_id: 'd1111111-1111-1111-1111-111111111111',
    doctor_id: 'd3333333-3333-3333-3333-333333333333',
    consultation_date: '2026-02-24T16:00:00Z',
    symptoms: 'Mild exertion dyspnea after climbing 3 flights of stairs, occasional morning headaches during busy work weeks.',
    observations: 'BP: 128/82 mmHg, HR: 70 bpm regular, SpO2: 99% on room air. S1/S2 distinct, faint soft systolic click audible at apex.',
    diagnosis: 'Well-managed Essential Hypertension with Trace Mitral Valve Regurgitation',
    clinical_notes: 'Patient exhibits excellent adherence to Lisinopril. Dietary sodium intake is moderate. Lifestyle and aerobic conditioning counseling given.',
    treatment_plan: 'Continue Lisinopril 10mg daily. Aerobic exercise 30 mins 4x/week. Repeat lipid profile in 6 months.',
    follow_up_date: '2026-05-25',
    created_at: '2026-02-24T16:25:00Z',
    prescription: INITIAL_PRESCRIPTIONS[0],
  },
];

const STORAGE_KEY = 'hosai_state_v2';

function getStoredState(): HosaiState {
  if (typeof window === 'undefined') {
    return {
      authenticatedUserId: INITIAL_PROFILES[0].id,
      profiles: INITIAL_PROFILES,
      patientProfiles: INITIAL_PATIENT_PROFILES,
      doctorProfiles: INITIAL_DOCTOR_PROFILES,
      hospitals: INITIAL_HOSPITALS,
      doctorHospitals: INITIAL_DOCTOR_HOSPITALS,
      patientDoctorAccess: INITIAL_ACCESS,
      medicalConditions: INITIAL_CONDITIONS,
      allergies: INITIAL_ALLERGIES,
      medications: INITIAL_MEDICATIONS,
      medicalRecords: INITIAL_RECORDS,
      consultations: INITIAL_CONSULTATIONS,
      prescriptions: INITIAL_PRESCRIPTIONS,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure schema conformity
      if (parsed.profiles && parsed.profiles[0]?.username) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading HOSAI state from localStorage:', e);
  }

  const defaultState: HosaiState = {
    authenticatedUserId: INITIAL_PROFILES[0].id,
    profiles: INITIAL_PROFILES,
    patientProfiles: INITIAL_PATIENT_PROFILES,
    doctorProfiles: INITIAL_DOCTOR_PROFILES,
    hospitals: INITIAL_HOSPITALS,
    doctorHospitals: INITIAL_DOCTOR_HOSPITALS,
    patientDoctorAccess: INITIAL_ACCESS,
    medicalConditions: INITIAL_CONDITIONS,
    allergies: INITIAL_ALLERGIES,
    medications: INITIAL_MEDICATIONS,
    medicalRecords: INITIAL_RECORDS,
    consultations: INITIAL_CONSULTATIONS,
    prescriptions: INITIAL_PRESCRIPTIONS,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
  } catch {}
  return defaultState;
}

let globalState: HosaiState | null = null;
let remoteSessionUserId: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== 'undefined' && globalState && !remoteSessionUserId) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }
  listeners.forEach((l) => l());
}

export function setRemoteAuthenticatedProfile(profile: UserProfile, patient?: PatientProfile, doctor?: DoctorProfile) {
  if (!globalState) globalState = getStoredState();
  if (remoteSessionUserId && remoteSessionUserId !== profile.id) removeRemoteProfile(remoteSessionUserId);
  const safeProfile = { ...profile, password: undefined };
  globalState.profiles = [safeProfile, ...globalState.profiles.filter((item) => item.id !== profile.id)];
  if (patient) globalState.patientProfiles = [patient, ...globalState.patientProfiles.filter((item) => item.id !== patient.id)];
  if (doctor) globalState.doctorProfiles = [doctor, ...globalState.doctorProfiles.filter((item) => item.id !== doctor.id)];
  globalState.authenticatedUserId = profile.id;
  remoteSessionUserId = profile.id;
  notify();
}

function removeRemoteProfile(id: string) {
  if (!globalState) return;
  globalState.profiles = globalState.profiles.filter((profile) => profile.id !== id);
  globalState.patientProfiles = globalState.patientProfiles.filter((profile) => profile.id !== id);
  globalState.doctorProfiles = globalState.doctorProfiles.filter((profile) => profile.id !== id);
}

export function clearAuthenticatedProfile() {
  if (!globalState) globalState = getStoredState();
  if (remoteSessionUserId) removeRemoteProfile(remoteSessionUserId);
  remoteSessionUserId = null;
  globalState.authenticatedUserId = null;
  notify();
}

export function useHosaiStore() {
  const [state, setState] = useState<HosaiState>(() => {
    if (!globalState) {
      globalState = getStoredState();
    }
    return globalState;
  });

  useEffect(() => {
    const handler = () => {
      if (globalState) {
        setState({ ...globalState });
      }
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const currentUser = state.authenticatedUserId
    ? state.profiles.find((p) => p.id === state.authenticatedUserId) || null
    : null;

  const currentPatientProfile = currentUser
    ? state.patientProfiles.find((p) => p.id === currentUser.id)
    : undefined;

  const currentDoctorProfile = currentUser
    ? state.doctorProfiles.find((p) => p.id === currentUser.id)
    : undefined;

  // Authentication: Login with role verification
  const login = (
    emailOrUsername: string,
    passwordAttempt: string,
    portalRole: UserRole
  ): { success: boolean; error?: string } => {
    if (!globalState) return { success: false, error: 'Database initializing' };

    const cleanInput = emailOrUsername.trim().toLowerCase();
    const user = globalState.profiles.find(
      (p) =>
        p.email.toLowerCase() === cleanInput ||
        p.username.toLowerCase() === cleanInput
    );

    if (!user) {
      return { success: false, error: 'No account registered with this email or username.' };
    }

    // Role boundary validation
    if (user.role !== portalRole) {
      return {
        success: false,
        error: `Access Denied: This account is registered as a ${user.role.toUpperCase()}. Please use the ${user.role.charAt(0).toUpperCase() + user.role.slice(1)} portal.`,
      };
    }

    // Password validation (matches user.password or default demo password)
    const validPassword = user.password || (user.role === 'admin' ? DEMO_ADMIN_PASSWORD : DEMO_PASSWORD);
    if (passwordAttempt !== validPassword) {
      return { success: false, error: 'Incorrect password entered.' };
    }

    globalState.authenticatedUserId = user.id;
    notify();
    return { success: true };
  };

  // Logout
  const logout = () => {
    if (!globalState) return;
    globalState.authenticatedUserId = null;
    notify();
  };

  // Register New User (Patients and Doctors only, NO public admin creation)
  const registerUser = (
    profileData: {
      email: string;
      username: string;
      password?: string;
      full_name: string;
      phone?: string;
      role: 'patient' | 'doctor';
      location?: string;
    },
    patientData?: Partial<PatientProfile>,
    doctorData?: Partial<DoctorProfile>
  ): { success: boolean; error?: string } => {
    if (!globalState) return { success: false, error: 'Database unavailable' };

    const cleanUsername = profileData.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = profileData.email.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, error: 'Please enter a valid alphanumeric username.' };
    }

    // Check unique username and email
    const usernameTaken = globalState.profiles.some(
      (p) => p.username.toLowerCase() === cleanUsername
    );
    if (usernameTaken) {
      return { success: false, error: `Username @${cleanUsername} is already taken. Please choose another.` };
    }

    const emailTaken = globalState.profiles.some(
      (p) => p.email.toLowerCase() === cleanEmail
    );
    if (emailTaken) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const now = new Date().toISOString();
    const newId = `usr-${Date.now()}`;

    const newProfile: UserProfile = {
      id: newId,
      email: cleanEmail,
      username: cleanUsername,
      password: profileData.password || DEMO_PASSWORD,
      full_name: profileData.full_name.trim(),
      phone: profileData.phone || '+1 (555) 000-0000',
      role: profileData.role,
      location: profileData.location || 'New York, NY',
      avatar_url:
        profileData.role === 'doctor'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: now,
      updated_at: now,
    };

    globalState.profiles = [newProfile, ...globalState.profiles];

    if (profileData.role === 'patient') {
      const newPatient: PatientProfile = {
        id: newId,
        date_of_birth: patientData?.date_of_birth || '1995-01-01',
        blood_group: patientData?.blood_group || 'O+',
        gender: patientData?.gender || 'prefer_not_to_say',
        emergency_contact_name: patientData?.emergency_contact_name || 'Emergency Contact',
        emergency_contact_phone: patientData?.emergency_contact_phone || '+1 (555) 000-0000',
        emergency_contact_relation: patientData?.emergency_contact_relation || 'Family',
        insurance_provider: patientData?.insurance_provider || '',
        insurance_policy_number: patientData?.insurance_policy_number || '',
        created_at: now,
        updated_at: now,
      };
      globalState.patientProfiles = [newPatient, ...globalState.patientProfiles];
    } else if (profileData.role === 'doctor') {
      const newDoctor: DoctorProfile = {
        id: newId,
        specialization: doctorData?.specialization || 'General Medicine',
        qualifications: doctorData?.qualifications || ['MBBS', 'Board Certified'],
        experience_years: doctorData?.experience_years || 2,
        registration_number: doctorData?.registration_number || `MED-NY-${Math.floor(10000 + Math.random() * 90000)}`,
        verification_status: 'pending', // Doctors are strictly pending until verified by Admin!
        bio: doctorData?.bio || `Physician practicing in ${doctorData?.specialization || 'General Medicine'}.`,
        consultation_fee: doctorData?.consultation_fee || 120,
        created_at: now,
        updated_at: now,
      };
      globalState.doctorProfiles = [newDoctor, ...globalState.doctorProfiles];
    }

    globalState.authenticatedUserId = newId;
    notify();
    return { success: true };
  };

  // Doctor searching for patient by username
  const searchPatientByUsername = (usernameQuery: string) => {
    if (!globalState) return null;
    const clean = usernameQuery.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return null;

    const patientUser = globalState.profiles.find(
      (p) => p.role === 'patient' && p.username.toLowerCase() === clean
    );
    if (!patientUser) return null;

    const patientProf = globalState.patientProfiles.find((p) => p.id === patientUser.id);
    const accessRow = globalState.patientDoctorAccess.find(
      (a) => a.patient_id === patientUser.id && a.doctor_id === globalState?.authenticatedUserId
    );

    return {
      user: patientUser,
      profile: patientProf,
      accessStatus: accessRow ? accessRow.access_status : 'none',
      accessId: accessRow?.id,
    };
  };

  // Doctor initiates an Access Request for a Patient
  const requestPatientAccess = (
    doctorId: string,
    patientId: string,
    note?: string
  ): { success: boolean; message: string } => {
    if (!globalState) return { success: false, message: 'Database offline' };

    const existing = globalState.patientDoctorAccess.find(
      (a) => a.patient_id === patientId && a.doctor_id === doctorId
    );

    if (existing) {
      if (existing.access_status === 'active') {
        return { success: false, message: 'You already possess active clinical access to this patient.' };
      }
      if (existing.access_status === 'pending') {
        return { success: false, message: 'An access request is already pending review with this patient.' };
      }
      // If was revoked or rejected, re-request
      globalState.patientDoctorAccess = globalState.patientDoctorAccess.map((a) =>
        a.id === existing.id
          ? {
              ...a,
              access_status: 'pending',
              requested_by: 'doctor',
              request_note: note || 'Consultation request from treating physician',
              granted_at: new Date().toISOString(),
            }
          : a
      );
      notify();
      return { success: true, message: 'Access request successfully resent to patient.' };
    }

    const newAccess: PatientDoctorAccess = {
      id: `acc-${Date.now()}`,
      patient_id: patientId,
      doctor_id: doctorId,
      access_status: 'pending',
      requested_by: 'doctor',
      request_note: note || 'Doctor requested clinical authorization to review medical records',
      granted_at: new Date().toISOString(),
    };

    globalState.patientDoctorAccess = [newAccess, ...globalState.patientDoctorAccess];
    notify();
    return { success: true, message: 'Access request submitted. Awaiting patient approval.' };
  };

  // Patient approves doctor access request
  const approveAccessRequest = (accessId: string) => {
    if (!globalState) return;
    const now = new Date().toISOString();
    globalState.patientDoctorAccess = globalState.patientDoctorAccess.map((a) =>
      a.id === accessId
        ? { ...a, access_status: 'active', granted_at: now }
        : a
    );
    notify();
  };

  // Patient declines/rejects doctor access request
  const declineAccessRequest = (accessId: string) => {
    if (!globalState) return;
    globalState.patientDoctorAccess = globalState.patientDoctorAccess.map((a) =>
      a.id === accessId
        ? { ...a, access_status: 'rejected' }
        : a
    );
    notify();
  };

  // Patient revokes existing doctor access
  const revokeDoctorAccess = (patientId: string, doctorId: string) => {
    if (!globalState) return;
    globalState.patientDoctorAccess = globalState.patientDoctorAccess.map((a) =>
      a.patient_id === patientId && a.doctor_id === doctorId
        ? { ...a, access_status: 'revoked' }
        : a
    );
    notify();
  };

  // Patient grants access directly to a doctor
  const grantDoctorAccess = (patientId: string, doctorId: string) => {
    if (!globalState) return;
    const existing = globalState.patientDoctorAccess.find(
      (a) => a.patient_id === patientId && a.doctor_id === doctorId
    );
    const now = new Date().toISOString();
    if (existing) {
      globalState.patientDoctorAccess = globalState.patientDoctorAccess.map((a) =>
        a.id === existing.id
          ? { ...a, access_status: 'active', granted_at: now }
          : a
      );
    } else {
      const newAccess: PatientDoctorAccess = {
        id: `acc-${Date.now()}`,
        patient_id: patientId,
        doctor_id: doctorId,
        access_status: 'active',
        requested_by: 'patient',
        granted_at: now,
      };
      globalState.patientDoctorAccess = [newAccess, ...globalState.patientDoctorAccess];
    }
    notify();
  };

  // Allergies
  const addAllergy = (allergy: Omit<Allergy, 'id' | 'created_at'>) => {
    if (!globalState) return;
    const newAllergy: Allergy = {
      ...allergy,
      id: `alg-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    globalState.allergies = [newAllergy, ...globalState.allergies];
    notify();
  };

  const removeAllergy = (id: string) => {
    if (!globalState) return;
    globalState.allergies = globalState.allergies.filter((a) => a.id !== id);
    notify();
  };

  // Conditions
  const addCondition = (condition: Omit<MedicalCondition, 'id' | 'created_at'>) => {
    if (!globalState) return;
    const newCondition: MedicalCondition = {
      ...condition,
      id: `cnd-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    globalState.medicalConditions = [newCondition, ...globalState.medicalConditions];
    notify();
  };

  const removeCondition = (id: string) => {
    if (!globalState) return;
    globalState.medicalConditions = globalState.medicalConditions.filter((c) => c.id !== id);
    notify();
  };

  // Medications
  const addMedication = (med: Omit<Medication, 'id' | 'created_at'>) => {
    if (!globalState) return;
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    globalState.medications = [newMed, ...globalState.medications];
    notify();
  };

  const removeMedication = (id: string) => {
    if (!globalState) return;
    globalState.medications = globalState.medications.filter((m) => m.id !== id);
    notify();
  };

  // Medical Records
  const uploadMedicalRecord = (record: Omit<MedicalRecord, 'id' | 'created_at'>) => {
    if (!globalState) return;
    const newRecord: MedicalRecord = {
      ...record,
      id: `rec-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    globalState.medicalRecords = [newRecord, ...globalState.medicalRecords];
    notify();
  };

  const removeMedicalRecord = (id: string) => {
    if (!globalState) return;
    globalState.medicalRecords = globalState.medicalRecords.filter((r) => r.id !== id);
    notify();
  };

  // Consultations & Prescriptions
  const addConsultationWithPrescription = (
    consultationData: Omit<Consultation, 'id' | 'created_at' | 'prescription'>,
    prescriptionData?: {
      general_instructions?: string;
      items: Array<Omit<PrescriptionItem, 'id' | 'prescription_id'>>;
    }
  ) => {
    if (!globalState) return;
    const consId = `cons-${Date.now()}`;
    const prescId = `presc-${Date.now()}`;
    const now = new Date().toISOString();

    let newPrescription: Prescription | undefined = undefined;

    if (prescriptionData && prescriptionData.items.length > 0) {
      const items: PrescriptionItem[] = prescriptionData.items.map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        prescription_id: prescId,
      }));

      newPrescription = {
        id: prescId,
        consultation_id: consId,
        patient_id: consultationData.patient_id,
        doctor_id: consultationData.doctor_id,
        prescription_date: new Date().toISOString().split('T')[0],
        general_instructions: prescriptionData.general_instructions,
        is_dispensed: false,
        created_at: now,
        items,
      };

      globalState.prescriptions = [newPrescription, ...globalState.prescriptions];

      // Synchronize into patient's active medication list
      items.forEach((item) => {
        const medExists = globalState!.medications.some(
          (m) =>
            m.patient_id === consultationData.patient_id &&
            m.medication_name.toLowerCase() === item.medicine_name.toLowerCase() &&
            m.status === 'active'
        );
        if (!medExists) {
          const doc = globalState!.profiles.find((p) => p.id === consultationData.doctor_id);
          globalState!.medications = [
            {
              id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              patient_id: consultationData.patient_id,
              medication_name: item.medicine_name,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              status: 'active',
              prescribed_by: doc?.full_name || 'Attending Physician',
              created_at: now,
            },
            ...globalState!.medications,
          ];
        }
      });
    }

    const newConsultation: Consultation = {
      ...consultationData,
      id: consId,
      created_at: now,
      prescription: newPrescription,
    };

    globalState.consultations = [newConsultation, ...globalState.consultations];
    notify();
  };

  // Admin Actions: Doctor verification
  const setDoctorVerificationStatus = (doctorId: string, status: 'verified' | 'rejected') => {
    if (!globalState) return;
    const now = new Date().toISOString();
    globalState.doctorProfiles = globalState.doctorProfiles.map((d) =>
      d.id === doctorId ? { ...d, verification_status: status, updated_at: now } : d
    );
    notify();
  };

  // Admin Actions: Hospital Management
  const addHospital = (hospital: Omit<Hospital, 'id' | 'created_at'>) => {
    if (!globalState) return;
    const newHospital: Hospital = {
      ...hospital,
      id: `hosp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    globalState.hospitals = [newHospital, ...globalState.hospitals];
    notify();
  };

  const removeHospital = (id: string) => {
    if (!globalState) return;
    globalState.hospitals = globalState.hospitals.filter((h) => h.id !== id);
    notify();
  };

  // Reset to seed data
  const resetToSeed = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      globalState = getStoredState();
      notify();
    }
  };

  return {
    state,
    currentUser,
    currentPatientProfile,
    currentDoctorProfile,
    login,
    logout,
    registerUser,
    searchPatientByUsername,
    requestPatientAccess,
    approveAccessRequest,
    declineAccessRequest,
    grantDoctorAccess,
    revokeDoctorAccess,
    addAllergy,
    removeAllergy,
    addCondition,
    removeCondition,
    addMedication,
    removeMedication,
    uploadMedicalRecord,
    removeMedicalRecord,
    addConsultationWithPrescription,
    setDoctorVerificationStatus,
    addHospital,
    removeHospital,
    resetToSeed,
  };
}
