'use client';

import React from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  AlertTriangle,
  HeartPulse,
  Pill,
  FileText,
  Stethoscope,
  Bot,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
} from 'lucide-react';
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
  const {
    currentUser,
    currentPatientProfile,
    state,
    approveAccessRequest,
    declineAccessRequest,
  } = useHosaiStore();

  if (!currentUser) return null;

  const allergies = state.allergies.filter((a) => a.patient_id === currentUser.id);
  const severeAllergies = allergies.filter(
    (a) => a.severity === 'severe' || a.severity === 'life_threatening'
  );
  const conditions = state.medicalConditions.filter((c) => c.patient_id === currentUser.id);
  const medications = state.medications.filter(
    (m) => m.patient_id === currentUser.id && m.status === 'active'
  );
  const records = state.medicalRecords.filter((r) => r.patient_id === currentUser.id);
  const consultations = state.consultations.filter((c) => c.patient_id === currentUser.id);
  const latestConsultation = consultations[0];

  // Incoming Doctor Access Requests (pending review)
  const pendingDoctorRequests = state.patientDoctorAccess
    .filter((a) => a.patient_id === currentUser.id && a.access_status === 'pending')
    .map((access) => {
      const docUser = state.profiles.find((p) => p.id === access.doctor_id);
      const docProf = state.doctorProfiles.find((d) => d.id === access.doctor_id);
      return { access, docUser, docProf };
    });

  return (
    <div className="space-y-6">
      {/* Welcome & Identity Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Patient Health Record
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {currentUser.full_name}
            </h1>
            <p className="text-slate-500 text-xs">
              Username: <span className="font-mono font-medium text-slate-700">@{currentUser.username}</span> • Blood Group:{' '}
              <span className="font-semibold text-slate-800">{currentPatientProfile?.blood_group || 'O+'}</span> • Location:{' '}
              {currentUser.location || 'New York, NY'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenUploadModal}
              className="btn-press flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
              Upload Medical Report
            </button>
            <button
              onClick={onOpenAiAssistant}
              className="btn-press flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* INCOMING DOCTOR ACCESS REQUESTS NOTIFICATION BANNER */}
      {pendingDoctorRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-600" />
              Incoming Clinical Access Requests ({pendingDoctorRequests.length})
            </div>
            <span className="text-[11px] text-amber-700">Patient Consent Required</span>
          </div>

          <div className="space-y-2">
            {pendingDoctorRequests.map(({ access, docUser, docProf }) => (
              <div
                key={access.id}
                className="bg-white p-3 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{docUser?.full_name || 'Attending Physician'}</span>
                    <span className="text-indigo-600 font-medium">({docProf?.specialization || 'Medicine'})</span>
                    <span className="text-[10px] text-slate-400 font-mono">@{docUser?.username}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Note: &quot;{access.request_note || 'Requested clinical authorization to review continuous health history.'}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      approveAccessRequest(access.id);
                      toast.success(`Access Approved for ${docUser?.full_name}`, {
                        description: 'Doctor can now review your continuous medical history.',
                      });
                    }}
                    className="btn-press flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Access
                  </button>
                  <button
                    onClick={() => {
                      declineAccessRequest(access.id);
                      toast.info(`Declined access request from ${docUser?.full_name}`);
                    }}
                    className="btn-press flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Medical Alert Bar */}
      {severeAllergies.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Critical Medical Allergy Alert
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-200 text-rose-900">
                Attending Warning
              </span>
            </div>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
              Severe adverse reactions logged for{' '}
              <span className="font-semibold">{severeAllergies.map((a) => a.allergen).join(', ')}</span>.
              This clinical warning is prominently flagged to treating physicians before prescribing.
            </p>
          </div>
          <button
            onClick={() => onNavigate('passport')}
            className="text-xs font-semibold text-rose-800 hover:text-rose-950 flex items-center gap-1 shrink-0"
          >
            Review <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Blood Group</span>
            <span className="text-[11px] font-mono text-slate-400">Rh Factor</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {currentPatientProfile?.blood_group || 'O+'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Verified lab blood typing</div>
        </div>

        <div
          onClick={() => onNavigate('passport')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Conditions</span>
            <HeartPulse className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{conditions.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {conditions.filter((c) => c.status === 'managed').length} managed,{' '}
            {conditions.filter((c) => c.status === 'active').length} active
          </div>
        </div>

        <div
          onClick={() => onNavigate('passport')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Meds</span>
            <Pill className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{medications.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Daily dosage regimen on schedule</div>
        </div>

        <div
          onClick={() => onNavigate('passport')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Vault Files</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{records.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Encrypted diagnostic documents</div>
        </div>
      </div>

      {/* Main Grid: Latest Consultation + Discovery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Latest Doctor Consultation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Latest Clinical Consultation</h2>
                  <p className="text-xs text-slate-500">Official medical encounter assessment</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('passport')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                View History <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {latestConsultation ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Encounter on {formatDate(latestConsultation.consultation_date)}
                  </div>
                  {latestConsultation.follow_up_date && (
                    <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Follow-up: {formatDate(latestConsultation.follow_up_date)}
                    </span>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Clinical Diagnosis
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {latestConsultation.diagnosis}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    <span className="font-semibold text-slate-700">Treatment Plan:</span>{' '}
                    {latestConsultation.treatment_plan}
                  </div>
                </div>

                {latestConsultation.prescription &&
                  latestConsultation.prescription.items.length > 0 && (
                    <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-indigo-600" />
                          Prescribed Medications ({latestConsultation.prescription.items.length})
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                          Signed Rx
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {latestConsultation.prescription.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100"
                          >
                            <span className="font-semibold text-slate-800">{item.medicine_name}</span>
                            <span className="text-slate-500 font-medium">
                              {item.dosage} • {item.frequency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="mt-4 text-center py-6 text-xs text-slate-400">
                No past consultations logged.
              </div>
            )}
          </div>

          {/* Recent Records */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Recent Medical Documents</h2>
                  <p className="text-xs text-slate-500">Verified diagnostic reports and scans</p>
                </div>
              </div>
              <button
                onClick={onOpenUploadModal}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                + Add Record
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {records.slice(0, 3).map((record) => (
                <div key={record.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px] uppercase font-bold">
                      {record.record_type.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{record.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {formatDate(record.record_date)} • {record.file_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {record.record_type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Prompt Card & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Bot className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">AI Health Assistant</h3>
                <p className="text-xs text-slate-500">Context-Aware Medical Insights</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Have questions about your lab tests, ECG findings, or medications? Ask the assistant for plain-English summaries.
            </p>

            <button
              onClick={onOpenAiAssistant}
              className="btn-press w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors text-center block"
            >
              Open Interactive Assistant
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Care Team &amp; Facilities
            </h3>

            <button
              onClick={() => onNavigate('doctors')}
              className="btn-press w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Find Qualified Doctors</div>
                  <div className="text-[11px] text-slate-500">Search by specialty &amp; experience</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('hospitals')}
              className="btn-press w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Nearby Hospitals</div>
                  <div className="text-[11px] text-slate-500">Emergency &amp; specialized units</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
