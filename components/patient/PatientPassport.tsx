'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  AlertTriangle,
  HeartPulse,
  Pill,
  FileText,
  Calendar,
  Shield,
  Plus,
  Trash2,
  FileCheck,
  Stethoscope,
  Clock,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  UserX,
} from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import { AddAllergyModal } from './AddAllergyModal';
import { AddConditionModal } from './AddConditionModal';
import { AddMedicationModal } from './AddMedicationModal';
import { RecordUploadModal } from './RecordUploadModal';
import { toast } from 'sonner';

interface PatientPassportProps {
  patientId?: string; // defaults to currentUser.id
  readOnly?: boolean; // when doctor views it
}

type PassportTab = 'allergies' | 'conditions' | 'medications' | 'records' | 'consultations' | 'doctors';

export const PatientPassport: React.FC<PatientPassportProps> = ({
  patientId,
  readOnly = false,
}) => {
  const {
    state,
    currentUser,
    removeAllergy,
    removeCondition,
    removeMedication,
    removeMedicalRecord,
    revokeDoctorAccess,
    approveAccessRequest,
    declineAccessRequest,
  } = useHosaiStore();

  const targetId = patientId || currentUser?.id || '';
  const patientUser = state.profiles.find((p) => p.id === targetId);
  const patientProfile = state.patientProfiles.find((p) => p.id === targetId);

  const [activeTab, setActiveTab] = useState<PassportTab>('allergies');

  // Modals
  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRecordPreview, setSelectedRecordPreview] = useState<string | null>(null);

  // Filtered lists
  const allergies = state.allergies.filter((a) => a.patient_id === targetId);
  const conditions = state.medicalConditions.filter((c) => c.patient_id === targetId);
  const medications = state.medications.filter((m) => m.patient_id === targetId);
  const records = state.medicalRecords.filter((r) => r.patient_id === targetId);
  const consultations = state.consultations.filter((c) => c.patient_id === targetId);

  // Authorized care team & access requests
  const accessRows = state.patientDoctorAccess.filter((a) => a.patient_id === targetId);

  const activeAuthorizedDoctors = accessRows
    .filter((a) => a.access_status === 'active')
    .map((a) => {
      const docUser = state.profiles.find((p) => p.id === a.doctor_id);
      const docProf = state.doctorProfiles.find((d) => d.id === a.doctor_id);
      return { access: a, user: docUser, profile: docProf };
    });

  const pendingRequests = accessRows
    .filter((a) => a.access_status === 'pending')
    .map((a) => {
      const docUser = state.profiles.find((p) => p.id === a.doctor_id);
      const docProf = state.doctorProfiles.find((d) => d.id === a.doctor_id);
      return { access: a, user: docUser, profile: docProf };
    });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'life_threatening':
      case 'severe':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            {severity === 'life_threatening' ? 'Life Threatening' : 'Severe'}
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Moderate
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Mild
          </span>
        );
    }
  };

  const getConditionStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Active Under Care
          </span>
        );
      case 'managed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Well Managed
          </span>
        );
      case 'in_remission':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            In Remission
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Resolved
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                patientUser?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
              }
              alt={patientUser?.full_name || 'Patient'}
              className="w-16 h-16 rounded-2xl object-cover ring-1 ring-slate-200 shadow-xs"
            />
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-xl font-bold text-slate-900">{patientUser?.full_name}</h1>
                <span className="font-mono text-xs text-slate-500 font-medium">
                  @{patientUser?.username}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  Blood Group: {patientProfile?.blood_group || 'O+'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                DOB: {formatDate(patientProfile?.date_of_birth)} • Gender:{' '}
                <span className="capitalize">{patientProfile?.gender || 'Female'}</span> • Emergency:{' '}
                {patientProfile?.emergency_contact_name} ({patientProfile?.emergency_contact_relation},{' '}
                {patientProfile?.emergency_contact_phone})
              </p>
              {patientProfile?.insurance_provider && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Insurance: {patientProfile.insurance_provider} ({patientProfile.insurance_policy_number})
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-base font-bold text-rose-700">{allergies.length}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Allergies
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-base font-bold text-amber-700">{conditions.length}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Conditions
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-base font-bold text-indigo-700">{medications.length}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Medications
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-base font-bold text-sky-700">{records.length}</div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Vault Files
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t border-slate-100 overflow-x-auto">
          {([
            { id: 'allergies', label: 'Allergies & Alerts', icon: AlertTriangle, count: allergies.length },
            { id: 'conditions', label: 'Medical Conditions', icon: HeartPulse, count: conditions.length },
            { id: 'medications', label: 'Current Medications', icon: Pill, count: medications.length },
            { id: 'records', label: 'Medical Documents Vault', icon: FileText, count: records.length },
            { id: 'consultations', label: 'Consultations & Rx', icon: FileCheck, count: consultations.length },
            { id: 'doctors', label: 'Care Team & Access', icon: Stethoscope, count: activeAuthorizedDoctors.length + pendingRequests.length },
          ] satisfies { id: PassportTab; label: string; icon: typeof AlertTriangle; count: number }[]).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ALLERGIES */}
      {activeTab === 'allergies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Allergies &amp; Adverse Reactions</h2>
              <p className="text-xs text-slate-500">
                Critical safety markers flagged to attending doctors prior to prescribing.
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowAllergyModal(true)}
                className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Allergy
              </button>
            )}
          </div>

          {allergies.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No allergies recorded</p>
              <p className="text-xs text-slate-500 mt-1">No known drug, environmental, or food allergies.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        {allergy.allergen}
                      </div>
                      {getSeverityBadge(allergy.severity)}
                    </div>
                    <div className="text-xs text-slate-700 mb-1">
                      <span className="font-semibold text-slate-500">Reaction:</span> {allergy.reaction}
                    </div>
                    {allergy.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-2">
                        &quot;{allergy.notes}&quot;
                      </p>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>Logged: {formatDate(allergy.created_at)}</span>
                      <button
                        onClick={() => {
                          removeAllergy(allergy.id);
                          toast.info(`Removed allergy: ${allergy.allergen}`);
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICAL CONDITIONS */}
      {activeTab === 'conditions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Diagnosed Medical Conditions</h2>
              <p className="text-xs text-slate-500">
                Chronic illnesses and ongoing medical management.
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowConditionModal(true)}
                className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Condition
              </button>
            )}
          </div>

          {conditions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No medical conditions recorded</p>
              <p className="text-xs text-slate-500 mt-1">Add any previous diagnoses or chronic illnesses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{condition.disease_name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> Diagnosed: {formatDate(condition.diagnosed_date)}
                      </p>
                    </div>
                    {getConditionStatusBadge(condition.status)}
                  </div>
                  {condition.description && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-2 leading-relaxed">
                      {condition.description}
                    </p>
                  )}
                  {!readOnly && (
                    <div className="flex items-center justify-end pt-3 mt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          removeCondition(condition.id);
                          toast.info(`Removed condition: ${condition.disease_name}`);
                        }}
                        className="text-slate-400 hover:text-rose-600 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEDICATIONS */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Current Medications &amp; Dosages</h2>
              <p className="text-xs text-slate-500">
                Prescription drugs, maintenance regimens, and schedules.
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowMedicationModal(true)}
                className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medication
              </button>
            )}
          </div>

          {medications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No active medications</p>
              <p className="text-xs text-slate-500 mt-1">Prescriptions issued by doctors will automatically appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Medication</th>
                    <th className="py-3 px-4">Dosage</th>
                    <th className="py-3 px-4">Frequency</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Prescribed By</th>
                    <th className="py-3 px-4">Status</th>
                    {!readOnly && <th className="py-3 px-4 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {medications.map((med) => (
                    <tr key={med.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-indigo-500" />
                        {med.medication_name}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{med.dosage}</td>
                      <td className="py-3 px-4 text-slate-600">{med.frequency}</td>
                      <td className="py-3 px-4 text-slate-600">{med.duration || 'Ongoing'}</td>
                      <td className="py-3 px-4 text-slate-600">{med.prescribed_by || 'Primary Care'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            med.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {med.status}
                        </span>
                      </td>
                      {!readOnly && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              removeMedication(med.id);
                              toast.info(`Removed medication: ${med.medication_name}`);
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEDICAL RECORDS VAULT */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Medical Records Vault</h2>
              <p className="text-xs text-slate-500">
                Uploaded diagnostic reports, lab blood tests, and high-resolution imaging scans.
              </p>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Document
              </button>
            )}
          </div>

          {records.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No medical documents uploaded</p>
              <p className="text-xs text-slate-500 mt-1">Upload lab results, discharge letters, or radiology scans.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        {rec.record_type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(rec.record_date)}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mb-1">{rec.title}</h3>
                    <p className="text-xs text-slate-400 mb-2 truncate">File: {rec.file_name}</p>

                    {rec.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl line-clamp-3 leading-relaxed">
                        {rec.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">{formatBytes(rec.file_size_bytes)}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedRecordPreview(rec.title)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-slate-50 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          toast.success(`Downloading ${rec.file_name}`, {
                            description: 'Verified copy retrieved from secure storage.',
                          });
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {!readOnly && (
                        <button
                          onClick={() => {
                            removeMedicalRecord(rec.id);
                            toast.info(`Deleted record: ${rec.title}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONSULTATIONS & PRESCRIPTIONS */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Consultation History &amp; Prescriptions</h2>
            <p className="text-xs text-slate-500">
              Official clinical encounters documented by attending physicians and itemized digital prescriptions.
            </p>
          </div>

          {consultations.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No consultations logged yet</p>
              <p className="text-xs text-slate-500 mt-1">
                When a doctor conducts an authorized consultation, their diagnosis and prescriptions appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((cons) => {
                const doctor = state.profiles.find((p) => p.id === cons.doctor_id);
                const doctorProf = state.doctorProfiles.find((d) => d.id === cons.doctor_id);
                const prescription = cons.prescription;

                return (
                  <div
                    key={cons.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                          <Stethoscope className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {doctor?.full_name || 'Attending Physician'}
                          </div>
                          <p className="text-xs text-slate-500">
                            {doctorProf?.specialization || 'General Medicine'} • License: {doctorProf?.registration_number}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 sm:justify-end">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(cons.consultation_date)}
                        </span>
                        {cons.follow_up_date && (
                          <span className="text-[11px] text-sky-600 font-medium">
                            Follow-up: {formatDate(cons.follow_up_date)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                        <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                          Reported Symptoms:
                        </span>
                        <p className="text-slate-800 leading-relaxed">{cons.symptoms}</p>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                        <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                          Clinical Observations &amp; Vitals:
                        </span>
                        <p className="text-slate-800 leading-relaxed">{cons.observations}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Primary Clinical Diagnosis:
                        </span>
                        <div className="text-sm font-bold text-slate-900">{cons.diagnosis}</div>
                      </div>
                      <div className="text-xs text-slate-700">
                        <span className="font-semibold text-slate-900">Treatment Plan:</span> {cons.treatment_plan}
                      </div>
                      {cons.clinical_notes && (
                        <div className="text-xs text-slate-500 italic mt-1">
                          Doctor Notes: &quot;{cons.clinical_notes}&quot;
                        </div>
                      )}
                    </div>

                    {prescription && prescription.items && prescription.items.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Signed Digital Prescription
                          </h4>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                            Verified
                          </span>
                        </div>

                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100">
                              <tr>
                                <th className="py-2.5 px-3">Medicine</th>
                                <th className="py-2.5 px-3">Dosage</th>
                                <th className="py-2.5 px-3">Frequency</th>
                                <th className="py-2.5 px-3">Duration</th>
                                <th className="py-2.5 px-3">Instructions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {prescription.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                                    {item.medicine_name}
                                  </td>
                                  <td className="py-2.5 px-3 font-medium text-slate-700">{item.dosage}</td>
                                  <td className="py-2.5 px-3 text-slate-600">{item.frequency}</td>
                                  <td className="py-2.5 px-3 text-slate-600">{item.duration}</td>
                                  <td className="py-2.5 px-3 text-slate-600">{item.instructions || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {prescription.general_instructions && (
                            <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600 italic">
                              Instructions: {prescription.general_instructions}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CARE TEAM & ACCESS REQUESTS */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          {/* Incoming Pending Requests from Doctors */}
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Pending Doctor Access Requests</h3>
              </div>

              <div className="space-y-2">
                {pendingRequests.map(({ access, user, profile }) => (
                  <div
                    key={access.id}
                    className="bg-amber-50/60 rounded-xl p-4 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {user?.full_name} <span className="font-mono text-xs text-slate-500 font-normal">(@{user?.username})</span>
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        {profile?.specialization} • License: {profile?.registration_number}
                      </div>
                      <p className="text-slate-500 italic mt-1 text-[11px]">
                        Note: &quot;{access.request_note || 'Requested clinical authorization.'}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          approveAccessRequest(access.id);
                          toast.success(`Access Approved for ${user?.full_name}`);
                        }}
                        className="btn-press px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          declineAccessRequest(access.id);
                          toast.info(`Declined request from ${user?.full_name}`);
                        }}
                        className="btn-press px-3.5 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Authorized Doctors */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Authorized Doctors &amp; Care Team</h2>
              <p className="text-xs text-slate-500">
                Medical practitioners who have verified authorization to review your medical history.
              </p>
            </div>

            {activeAuthorizedDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">No doctors currently authorized</p>
                <p className="text-xs text-slate-500 mt-1">
                  Doctors can request access by searching your username (@{patientUser?.username}), or you can grant access via Find Doctors.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAuthorizedDoctors.map(({ access, user, profile }) => (
                  <div
                    key={access.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={user?.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                        alt={user?.full_name || 'Doctor'}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm">{user?.full_name}</h3>
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                        </div>
                        <p className="text-xs font-semibold text-indigo-600">{profile?.specialization}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          @{user?.username} • License #{profile?.registration_number}
                        </p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active • Granted {formatDate(access.granted_at)}
                        </span>
                      </div>
                    </div>

                    {!readOnly && (
                      <button
                        onClick={() => {
                          revokeDoctorAccess(targetId, user?.id || '');
                          toast.info(`Revoked medical record access for ${user?.full_name}`);
                        }}
                        className="btn-press flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Preview Modal Dialog */}
      {selectedRecordPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/50 p-3 backdrop-blur-xs sm:items-center sm:p-4">
          <div className="modal-enter relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl sm:max-h-[calc(100dvh-2rem)] sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Document Inspection</h3>
              <button
                onClick={() => setSelectedRecordPreview(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-900">{selectedRecordPreview}</div>
              <p className="text-slate-600">
                This document is encrypted and digitally signed on the HOSAI healthcare network.
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-500">
                Integrity Hash: 0x8f2c...49a1 (Verified Match)
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedRecordPreview(null)}
                className="btn-press px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Child Modals */}
      <AddAllergyModal
        isOpen={showAllergyModal}
        onClose={() => setShowAllergyModal(false)}
        patientId={targetId}
      />
      <AddConditionModal
        isOpen={showConditionModal}
        onClose={() => setShowConditionModal(false)}
        patientId={targetId}
      />
      <AddMedicationModal
        isOpen={showMedicationModal}
        onClose={() => setShowMedicationModal(false)}
        patientId={targetId}
      />
      <RecordUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        patientId={targetId}
      />
    </div>
  );
};
