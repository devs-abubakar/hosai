export type UserRole = 'patient' | 'doctor' | 'admin';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';
export type ConditionStatus = 'active' | 'managed' | 'in_remission' | 'resolved';
export type MedicationStatus = 'active' | 'completed' | 'discontinued';
export type RecordType = 'lab_report' | 'prescription' | 'imaging_xray' | 'discharge_summary' | 'vaccination' | 'other';
export type DoctorVerificationStatus = 'pending' | 'verified' | 'rejected';
export type AccessStatus = 'active' | 'revoked' | 'pending' | 'rejected';
export type AccessRequestedBy = 'doctor' | 'patient';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  password?: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string; // matches UserProfile.id
  date_of_birth: string;
  blood_group: BloodGroup;
  gender: Gender;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string; // matches UserProfile.id
  specialization: string;
  qualifications: string[];
  experience_years: number;
  registration_number: string;
  verification_status: DoctorVerificationStatus;
  bio?: string;
  consultation_fee: number;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  contact_phone: string;
  contact_email?: string;
  emergency_helpline: string;
  departments: string[];
  services: string[];
  rating: number;
  is_verified: boolean;
  image_url?: string;
  created_at: string;
}

export interface DoctorHospital {
  id: string;
  doctor_id: string;
  hospital_id: string;
  visiting_hours?: string;
  is_primary: boolean;
  hospital?: Hospital;
}

export interface PatientDoctorAccess {
  id: string;
  patient_id: string;
  doctor_id: string;
  access_status: AccessStatus;
  requested_by: AccessRequestedBy;
  request_note?: string;
  granted_at: string;
  expires_at?: string;
  doctor_profile?: DoctorProfile & { user: UserProfile };
  patient_profile?: PatientProfile & { user: UserProfile };
}

export interface MedicalCondition {
  id: string;
  patient_id: string;
  disease_name: string;
  description?: string;
  status: ConditionStatus;
  diagnosed_date: string;
  created_at: string;
}

export interface Allergy {
  id: string;
  patient_id: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  notes?: string;
  created_at: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  status: MedicationStatus;
  prescribed_by?: string;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  uploaded_by: string;
  title: string;
  record_type: RecordType;
  record_date: string;
  file_url: string;
  file_size_bytes?: number;
  file_name?: string;
  notes?: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_date: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  clinical_notes?: string;
  treatment_plan: string;
  follow_up_date?: string;
  created_at: string;
  doctor?: UserProfile & { doctor_profile?: DoctorProfile };
  prescription?: Prescription;
}

export interface Prescription {
  id: string;
  consultation_id: string;
  patient_id: string;
  doctor_id: string;
  prescription_date: string;
  general_instructions?: string;
  is_dispensed: boolean;
  created_at: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}
