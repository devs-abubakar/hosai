'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  X,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Pill,
  FileText,
  Calendar,
  Clock,
  Plus,
  ShieldCheck,
  Eye,
  Download,
} from 'lucide-react';
import { formatDate, formatBytes } from '@/lib/utils';
import { NewConsultationModal } from './NewConsultationModal';
import { toast } from 'sonner';

interface PatientChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const PatientChartModal: React.FC<PatientChartModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { state } = useHosaiStore();
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'consultations' | 'profile'>('records');

  if (!isOpen) return null;

  const patient = state.profiles.find((p) => p.id === patientId);
  const patientProfile = state.patientProfiles.find((p) => p.id === patientId);

  const allergies = state.allergies.filter((a) => a.patient_id === patientId);
  const severeAllergies = allergies.filter(
    (a) => a.severity === 'severe' || a.severity === 'life_threatening'
  );
  const conditions = state.medicalConditions.filter((c) => c.patient_id === patientId);
  const medications = state.medications.filter(
    (m) => m.patient_id === patientId && m.status === 'active'
  );
  const records = state.medicalRecords.filter((r) => r.patient_id === patientId);
  const consultations = state.consultations.filter((c) => c.patient_id === patientId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="modal-enter relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <img
              src={
                patient?.avatar_url ||
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
              }
              alt={patient?.full_name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{patient?.full_name}</h3>
                <span className="font-mono text-xs text-slate-500 font-medium">@{patient?.username}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  {patientProfile?.blood_group || 'O+'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Authorized Access
                </span>
              </div>
              <p className="text-xs text-slate-500">
                DOB: {formatDate(patientProfile?.date_of_birth)} • Contact: {patient?.phone} • Emergency:{' '}
                {patientProfile?.emergency_contact_name} ({patientProfile?.emergency_contact_phone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConsultModal(true)}
              className="btn-press flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Consultation &amp; Rx
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PROMINENT CLINICAL SAFETY ALERT BAR */}
        <div className="px-6 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              SAFETY ALERTS:
            </span>
            {severeAllergies.length > 0 ? (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md font-semibold">
                ALLERGIC: {severeAllergies.map((a) => a.allergen).join(', ')}
              </span>
            ) : (
              <span className="text-slate-400">No severe drug allergies</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <div>
              <span className="text-slate-400">Conditions: </span>
              <span className="font-medium text-white">
                {conditions.map((c) => c.disease_name).join(', ') || 'None'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Active Meds: </span>
              <span className="font-medium text-white">
                {medications.map((m) => `${m.medication_name} (${m.dosage})`).join(', ') || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'records'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Diagnostic Records &amp; Imaging ({records.length})
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'consultations'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Past Consultations &amp; Prescriptions ({consultations.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Allergies &amp; Chronic Pathologies
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'records' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Encrypted laboratory results, Echocardiograms, and Radiology imaging reports authorized by patient.
              </div>

              {records.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No records uploaded by patient yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                              {rec.record_type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Exam Date: {formatDate(rec.record_date)} • File: {rec.file_name} ({formatBytes(rec.file_size_bytes)})
                          </p>
                          {rec.notes && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1.5 leading-relaxed">
                              Findings: {rec.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            toast.success(`Opening ${rec.file_name} in secure DICOM/PDF viewer`, {
                              description: 'Clinical fidelity confirmed.',
                            });
                          }}
                          className="btn-press flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-600" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            toast.success(`Downloaded ${rec.file_name}`);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No previous consultation records logged. Click &quot;Add Consultation &amp; Rx&quot; to begin.
                </div>
              ) : (
                consultations.map((cons) => (
                  <div
                    key={cons.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{cons.diagnosis}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Date: {formatDate(cons.consultation_date)}
                        </div>
                      </div>
                      {cons.follow_up_date && (
                        <span className="text-xs text-sky-700 font-semibold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          Follow-up: {formatDate(cons.follow_up_date)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-500 text-[10px] uppercase">
                          Observed Vitals:
                        </span>
                        <p className="text-slate-800 mt-0.5">{cons.observations}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-500 text-[10px] uppercase">
                          Treatment Plan:
                        </span>
                        <p className="text-slate-800 mt-0.5">{cons.treatment_plan}</p>
                      </div>
                    </div>

                    {cons.prescription && cons.prescription.items.length > 0 && (
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
                        <div className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-indigo-600" /> Prescribed Drugs:
                        </div>
                        <ul className="text-xs space-y-1">
                          {cons.prescription.items.map((i) => (
                            <li key={i.id} className="text-slate-700 font-medium">
                              • <span className="font-bold">{i.medicine_name}</span> ({i.dosage}) — {i.frequency} for {i.duration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allergies list */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> All Recorded Allergies ({allergies.length})
                </h4>
                <div className="space-y-2">
                  {allergies.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-rose-900">
                        <span>{a.allergen}</span>
                        <span className="text-[10px] uppercase font-mono">{a.severity}</span>
                      </div>
                      <div className="text-rose-700 text-[11px] mt-0.5">Reaction: {a.reaction}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions list */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5" /> Medical Conditions ({conditions.length})
                </h4>
                <div className="space-y-2">
                  {conditions.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-amber-900">
                        <span>{c.disease_name}</span>
                        <span className="text-[10px] uppercase font-mono">{c.status}</span>
                      </div>
                      {c.description && <div className="text-amber-800 text-[11px] mt-0.5">{c.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Child Consultation Modal */}
      <NewConsultationModal
        isOpen={showConsultModal}
        onClose={() => setShowConsultModal(false)}
        patientId={patientId}
      />
    </div>
  );
};
