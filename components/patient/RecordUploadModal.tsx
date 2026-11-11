'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import { RecordType } from '@/types/database';
import { X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RecordUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const RecordUploadModal: React.FC<RecordUploadModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { uploadMedicalRecord, currentUser } = useHosaiStore();
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState<RecordType>('lab_report');
  const [recordDate, setRecordDate] = useState('2026-03-15');
  const [notes, setNotes] = useState('');
  const [simulatedFile, setSimulatedFile] = useState<{
    name: string;
    size: number;
    url: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSimulatedFile({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      });
      if (!title) {
        // Auto-fill title from filename without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDropSimulation = () => {
    // Helpful demo preset if user clicks dropzone directly
    setSimulatedFile({
      name: 'Blood_Lipid_Panel_Official_Report.pdf',
      size: 1420800,
      url: 'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico',
    });
    if (!title) {
      setTitle('Complete Blood & Lipid Profile');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim()) {
      toast.error('Please provide a descriptive title for this medical record.');
      return;
    }

    const fileName = simulatedFile?.name || `${title.replace(/\s+/g, '_')}_Document.pdf`;
    const fileSize = simulatedFile?.size || 1845000;
    const fileUrl =
      simulatedFile?.url ||
      'https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/favicon.ico';

    uploadMedicalRecord({
      patient_id: patientId,
      uploaded_by: currentUser.id,
      title: title.trim(),
      record_type: recordType,
      record_date: recordDate,
      file_url: fileUrl,
      file_name: fileName,
      file_size_bytes: fileSize,
      notes: notes.trim() || undefined,
    });

    toast.success(`Medical record uploaded: ${title}`, {
      description: 'Your treating doctors can now review this report.',
    });

    setTitle('');
    setRecordType('lab_report');
    setNotes('');
    setSimulatedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/50 p-3 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="modal-enter relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Upload Medical Document</h3>
              <p className="text-xs text-slate-500">
                Securely store lab reports, radiology scans, and prescriptions
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File Drag & Drop Target */}
          <div
            onClick={handleDropSimulation}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              simulatedFile
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-300 hover:border-sky-400 hover:bg-sky-50/20'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.dcm"
            />
            {simulatedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-900">
                    {simulatedFile.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {(simulatedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to secure
                  </div>
                </div>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-800">
                  Click to select file or drag &amp; drop
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, PNG, JPG, DICOM scans (up to 25 MB)
                </div>
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Record Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chest X-Ray PA View, Lipid Profile, Discharge Summary"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as RecordType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              >
                <option value="lab_report">Laboratory Report</option>
                <option value="imaging_xray">Imaging / X-Ray / MRI</option>
                <option value="prescription">External Prescription</option>
                <option value="discharge_summary">Discharge Summary</option>
                <option value="vaccination">Vaccination Record</option>
                <option value="other">Other Clinical Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Examination Date *
              </label>
              <input
                type="date"
                required
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Diagnostic Notes &amp; Observations
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Performed at Quest Diagnostics. Normal reference ranges except slightly elevated triglycerides."
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
              className="btn-press px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Save to Medical Records
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
