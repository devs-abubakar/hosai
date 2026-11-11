'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import { MedicationStatus } from '@/types/database';
import { X, Pill } from 'lucide-react';
import { toast } from 'sonner';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { addMedication } = useHosaiStore();
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily (morning)');
  const [duration, setDuration] = useState('Ongoing');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [status, setStatus] = useState<MedicationStatus>('active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName.trim() || !dosage.trim()) {
      toast.error('Please enter the medication name and dosage.');
      return;
    }

    addMedication({
      patient_id: patientId,
      medication_name: medicationName.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim() || undefined,
      status,
      prescribed_by: prescribedBy.trim() || undefined,
    });

    toast.success(`Medication logged: ${medicationName}`, {
      description: 'Your active medications list has been updated.',
    });

    setMedicationName('');
    setDosage('');
    setFrequency('Once daily (morning)');
    setDuration('Ongoing');
    setPrescribedBy('');
    setStatus('active');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="modal-enter relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add Current Medication</h3>
              <p className="text-xs text-slate-500">Track prescriptions to prevent drug-drug interactions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Medicine / Drug Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lisinopril, Metformin, Amoxicillin"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dosage / Strength *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 10 mg, 500 mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Frequency *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Twice daily with meals"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration
              </label>
              <input
                type="text"
                placeholder="e.g. Ongoing, 14 days"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Prescribing Doctor
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Marcus Vance"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MedicationStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            >
              <option value="active">Active (Currently taking)</option>
              <option value="completed">Completed (Course finished)</option>
              <option value="discontinued">Discontinued (Stopped by doctor)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-press px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-press px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Save Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
