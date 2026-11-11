'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import { AllergySeverity } from '@/types/database';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AddAllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const AddAllergyModal: React.FC<AddAllergyModalProps> = ({ isOpen, onClose, patientId }) => {
  const { addAllergy } = useHosaiStore();
  const [allergen, setAllergen] = useState('');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState<AllergySeverity>('severe');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergen.trim() || !reaction.trim()) {
      toast.error('Please specify both the allergen and typical reaction.');
      return;
    }

    addAllergy({
      patient_id: patientId,
      allergen: allergen.trim(),
      reaction: reaction.trim(),
      severity,
      notes: notes.trim() || undefined,
    });

    toast.success(`Allergy added: ${allergen}`, {
      description: 'Your clinical safety profile has been updated.',
    });

    setAllergen('');
    setReaction('');
    setSeverity('severe');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="modal-enter relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Add Medical Allergy</h3>
              <p className="text-xs text-slate-500">Alerts treating doctors to prevent adverse events</p>
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
              Allergen (Substance / Drug) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Penicillin, Peanuts, NSAIDs, Latex"
              value={allergen}
              onChange={(e) => setAllergen(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Severity *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as AllergySeverity)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            >
              <option value="mild">Mild (Localized rash, itching, sneezes)</option>
              <option value="moderate">Moderate (Urticaria, facial swelling, nausea)</option>
              <option value="severe">Severe (Bronchospasm, angioedema, hypotension)</option>
              <option value="life_threatening">Life Threatening (Full Anaphylactic Shock)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Observed Reaction Symptoms *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acute facial swelling, dyspnea, hives within 20 mins"
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Specialist Clinical Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Patient carries an EpiPen auto-injector. Confirmed via skin prick test."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              className="btn-press px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              Save Critical Allergy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
