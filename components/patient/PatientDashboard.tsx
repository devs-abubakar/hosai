'use client';

import React from 'react';
import { useHosaiStore } from '@/lib/store';
import { AlertTriangle, Bot, Building2, CheckCircle2, Clock, FileUp, Stethoscope, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface PatientDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAiAssistant: () => void;
  onOpenUploadModal: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigate,
  onOpenAiAssistant,
  onOpenUploadModal,
}) => {
  const { currentUser, state, approveAccessRequest, declineAccessRequest } = useHosaiStore();
  if (!currentUser) return null;

  const patientId = currentUser.id;
  const severeAllergies = state.allergies.filter(
    (allergy) => allergy.patient_id === patientId &&
      (allergy.severity === 'severe' || allergy.severity === 'life_threatening'),
  );
  const latestConsultation = state.consultations.find((consultation) => consultation.patient_id === patientId);
  const pendingRequests = state.patientDoctorAccess
    .filter((access) => access.patient_id === patientId && access.access_status === 'pending')
    .map((access) => ({
      access,
      doctor: state.profiles.find((profile) => profile.id === access.doctor_id),
      doctorProfile: state.doctorProfiles.find((profile) => profile.id === access.doctor_id),
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">Health overview</h1>
          <p className="mt-1 text-sm text-slate-600">Your care updates and actions that need attention.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:flex-none"
          >
            <FileUp aria-hidden="true" className="size-4" /> Upload report
          </button>
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:flex-none"
          >
            <Bot aria-hidden="true" className="size-4 text-sky-700" /> AI assistant
          </button>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <section aria-labelledby="access-requests-heading" className="rounded-xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
          <div className="mb-3 flex items-start gap-3">
            <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-800" />
            <div>
              <h2 id="access-requests-heading" className="text-sm font-semibold text-amber-950">
                Review doctor access {pendingRequests.length > 1 ? `(${pendingRequests.length})` : ''}
              </h2>
              <p className="mt-1 text-sm text-amber-900">A doctor is requesting permission to view your medical records.</p>
            </div>
          </div>
          <ul className="divide-y divide-amber-200">
            {pendingRequests.map(({ access, doctor, doctorProfile }) => (
              <li key={access.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-slate-900">{doctor?.full_name || 'Doctor'}</p>
                  <p className="text-sm text-slate-700">{doctorProfile?.specialization || 'Healthcare professional'}</p>
                  {access.request_note && <p className="mt-1 break-words text-sm text-slate-600">{access.request_note}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveAccessRequest(access.id);
                      toast.success('Doctor access approved.');
                    }}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:flex-none"
                  >
                    <CheckCircle2 aria-hidden="true" className="size-4" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      declineAccessRequest(access.id);
                      toast.info('Access request declined.');
                    }}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 sm:flex-none"
                  >
                    <XCircle aria-hidden="true" className="size-4" /> Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {severeAllergies.length > 0 && (
        <section aria-labelledby="allergy-alert-heading" className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 sm:p-5">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-rose-800" />
          <div className="min-w-0 flex-1">
            <h2 id="allergy-alert-heading" className="text-sm font-semibold text-rose-950">Critical allergy alert</h2>
            <p className="mt-1 break-words text-sm text-rose-900">
              {severeAllergies.map((allergy) => allergy.allergen).join(', ')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('passport')}
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-rose-900 underline decoration-rose-400 underline-offset-2 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
          >
            Review
          </button>
        </section>
      )}

      <section aria-labelledby="consultation-heading" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="consultation-heading" className="text-base font-semibold text-slate-950">Latest consultation</h2>
            {latestConsultation && <p className="mt-1 text-sm text-slate-600">{formatDate(latestConsultation.consultation_date)}</p>}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('passport')}
            className="min-h-11 self-start rounded-lg px-3 text-sm font-medium text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:self-auto"
          >
            View consultations
          </button>
        </div>
        {latestConsultation ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-900">{latestConsultation.diagnosis}</h3>
            <p className="mt-1 break-words text-sm leading-6 text-slate-700">{latestConsultation.treatment_plan}</p>
            {latestConsultation.follow_up_date && (
              <p className="mt-3 text-sm font-medium text-sky-900">Follow-up: {formatDate(latestConsultation.follow_up_date)}</p>
            )}
          </div>
        ) : (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">No consultations are recorded yet.</p>
        )}
      </section>

      <section aria-labelledby="care-options-heading">
        <h2 id="care-options-heading" className="mb-3 text-base font-semibold text-slate-950">Find care</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onNavigate('doctors')}
            className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            <Stethoscope aria-hidden="true" className="size-5 shrink-0 text-sky-800" />
            <span className="text-sm font-medium text-slate-900">Find a doctor</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('hospitals')}
            className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
          >
            <Building2 aria-hidden="true" className="size-5 shrink-0 text-sky-800" />
            <span className="text-sm font-medium text-slate-900">Find a hospital</span>
          </button>
        </div>
      </section>
    </div>
  );
};
