'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import { ConditionStatus } from '@/types/database';
import { X, HeartPulse } from 'lucide-react';
import { toast } from 'sonner';

interface AddConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const AddConditionModal: React.FC<AddConditionModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { addCondition } = useHosaiStore();
  const [diseaseName, setDiseaseName] = useState('');
  const [status, setStatus] = useState<ConditionStatus>('active');
  const [diagnosedDate, setDiagnosedDate] = useState('2026-03-01');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseName.trim()) {
      toast.error('Please enter the condition or disease name.');
      return;
    }

    addCondition({
      patient_id: patientId,
      disease_name: diseaseName.trim(),
      status,
      diagnosed_date: diagnosedDate,
      description: description.trim() || undefined,
    });

    toast.success(`Condition logged: ${diseaseName}`, {
      description: 'Added to your lifelong medical history.',
    });

    setDiseaseName('');
    setStatus('active');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/50 p-3 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="modal-enter relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add Medical Condition</h3>
              <p className="text-xs text-slate-500">Record chronic or acute diagnosed illnesses</p>
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
              Condition / Disease Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Essential Hypertension, Type 2 Diabetes, Asthma"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ConditionStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              >
                <option value="active">Active</option>
                <option value="managed">Managed</option>
                <option value="in_remission">In Remission</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Diagnosed Date *
              </label>
              <input
                type="date"
                required
                value={diagnosedDate}
                onChange={(e) => setDiagnosedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Summary / Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Under active lifestyle management and sodium-restricted diet. Monitored biannually."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
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
              className="btn-press px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
            >
              Save Condition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
