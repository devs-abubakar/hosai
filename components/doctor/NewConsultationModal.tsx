'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import { X, Stethoscope, Plus, Trash2, AlertTriangle, CheckCircle2, Pill } from 'lucide-react';
import { toast } from 'sonner';

interface NewConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const NewConsultationModal: React.FC<NewConsultationModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { addConsultationWithPrescription, currentUser, state } = useHosaiStore();

  const patient = state.profiles.find((p) => p.id === patientId);
  const patientAllergies = state.allergies.filter((a) => a.patient_id === patientId);

  // Form State
  const [symptoms, setSymptoms] = useState('');
  const [observations, setObservations] = useState('BP: 124/80 mmHg, HR: 72 bpm regular, SpO2: 99%');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-06-15');

  // Prescription Items State
  const [prescriptionItems, setPrescriptionItems] = useState<
    Array<{
      medicine_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>
  >([
    {
      medicine_name: '',
      dosage: '10 mg',
      frequency: 'Once daily (morning)',
      duration: '30 days',
      instructions: 'Take after breakfast',
    },
  ]);
  const [generalInstructions, setGeneralInstructions] = useState(
    'Continue low-sodium diet and hydrate well. Log blood pressure twice weekly.'
  );

  if (!isOpen || !currentUser) return null;

  const handleAddItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicine_name: '',
        dosage: '20 mg',
        frequency: 'Once daily (bedtime)',
        duration: '30 days',
        instructions: 'Take with water',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionItems(updated);
  };

  // Check for dangerous drug-allergy contraindications
  const detectedAllergyWarnings = prescriptionItems
    .filter((item) => item.medicine_name.trim().length > 0)
    .filter((item) =>
      patientAllergies.some((allergy) =>
        item.medicine_name.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
        allergy.allergen.toLowerCase().includes(item.medicine_name.toLowerCase())
      )
    );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim() || !symptoms.trim() || !treatmentPlan.trim()) {
      toast.error('Please fill in required clinical fields: Symptoms, Diagnosis, and Treatment Plan.');
      return;
    }

    if (detectedAllergyWarnings.length > 0) {
      const confirmIgnore = confirm(
        `CRITICAL CLINICAL ALERT: You are prescribing medications that match the patient's recorded allergies (${detectedAllergyWarnings
          .map((i) => i.medicine_name)
          .join(', ')}). Are you sure you wish to proceed?`
      );
      if (!confirmIgnore) return;
    }

    const validItems = prescriptionItems.filter((item) => item.medicine_name.trim().length > 0);

    addConsultationWithPrescription(
      {
        patient_id: patientId,
        doctor_id: currentUser.id,
        consultation_date: new Date().toISOString(),
        symptoms: symptoms.trim(),
        observations: observations.trim(),
        diagnosis: diagnosis.trim(),
        clinical_notes: clinicalNotes.trim() || undefined,
        treatment_plan: treatmentPlan.trim(),
        follow_up_date: followUpDate || undefined,
      },
      validItems.length > 0
        ? {
            general_instructions: generalInstructions.trim() || undefined,
            items: validItems,
          }
        : undefined
    );

    toast.success(`Consultation recorded for ${patient?.full_name}`, {
      description: 'Diagnosis and digital prescription attached to patient records.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="modal-enter relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                New Clinical Consultation &amp; Prescription
              </h3>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-slate-800">{patient?.full_name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Contraindication Alert Box if triggered */}
          {detectedAllergyWarnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">CRITICAL ALLERGY CONTRAINDICATION:</span> The medication you
                typed conflicts with patient&apos;s logged allergies. Avoid Beta-lactams or cross-reactive
                compounds.
              </div>
            </div>
          )}

          {/* Section 1: Clinical Notes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Clinical Evaluation
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reported Symptoms *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Mild shortness of breath on exertion, occasional palpitations"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Observations &amp; Vitals *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. BP: 124/80 mmHg, HR: 72 bpm, SpO2: 99%, S1/S2 normal"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Formal Diagnosis *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Compensated Stage 1 Hypertension with Normal Systolic Function"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Treatment &amp; Management Plan *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Continue Lisinopril 10mg daily. Moderate aerobic conditioning."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confidential Clinical Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient showed good compliance. Advised salt substitution."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Scheduled Follow-up Date
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Section 2: Prescription Builder */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  2. Digital Prescription Items
                </h4>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-press flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Medicine
              </button>
            </div>

            <div className="space-y-2.5">
              {prescriptionItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Item #{idx + 1}</span>
                    {prescriptionItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Drug Name (e.g. Lisinopril, Metformin)"
                        value={item.medicine_name}
                        onChange={(e) => handleItemChange(idx, 'medicine_name', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 10 mg)"
                        value={item.dosage}
                        onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Duration (e.g. 30 days)"
                        value={item.duration}
                        onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Frequency (e.g. Once daily after breakfast)"
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Special instructions (e.g. Take with water)"
                      value={item.instructions}
                      onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                General Prescription Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. Avoid dehydration, do not skip doses, call emergency if dizziness occurs"
                value={generalInstructions}
                onChange={(e) => setGeneralInstructions(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-press px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-press px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Sign &amp; Issue Consultation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
