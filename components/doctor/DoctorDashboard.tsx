'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  Users,
  Stethoscope,
  Building2,
  ChevronRight,
  AlertTriangle,
  HeartPulse,
  Pill,
  Search,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { PatientChartModal } from './PatientChartModal';
import { PatientUsernameSearch } from './PatientUsernameSearch';
import { formatDate } from '@/lib/utils';

export const DoctorDashboard: React.FC = () => {
  const { currentUser, currentDoctorProfile, state } = useHosaiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Authorized patients: find access records where doctor_id == currentUser.id and access_status == 'active'
  const authorizedAccess = state.patientDoctorAccess.filter(
    (a) => a.doctor_id === currentUser.id && a.access_status === 'active'
  );

  const authorizedPatients = authorizedAccess
    .map((access) => {
      const user = state.profiles.find((p) => p.id === access.patient_id);
      const profile = state.patientProfiles.find((p) => p.id === access.patient_id);
      const allergies = state.allergies.filter((a) => a.patient_id === access.patient_id);
      const conditions = state.medicalConditions.filter((c) => c.patient_id === access.patient_id);
      const records = state.medicalRecords.filter((r) => r.patient_id === access.patient_id);
      const consultations = state.consultations.filter(
        (c) => c.patient_id === access.patient_id && c.doctor_id === currentUser.id
      );

      return {
        access,
        user,
        profile,
        allergies,
        conditions,
        records,
        consultations,
      };
    })
    .filter((p) => p.user !== undefined);

  const filteredPatients = authorizedPatients.filter((p) =>
    p.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profile?.blood_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.conditions.some((c) => c.disease_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Affiliated hospitals
  const affiliations = state.doctorHospitals
    .filter((dh) => dh.doctor_id === currentUser.id)
    .map((dh) => {
      const hospital = state.hospitals.find((h) => h.id === dh.hospital_id);
      return { ...dh, hospital };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-950">Patients</h1>
          <p className="mt-1 text-sm text-slate-600">Search for a patient or open a chart you are authorized to view.</p>
        </div>
        {currentDoctorProfile?.verification_status !== 'verified' && (
          <p role="status" className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 sm:mt-0">
            Doctor verification is pending. Patient record access is unavailable until approval.
          </p>
        )}
      </div>

      {/* FEATURE: Doctor Patient Search by Username & Access Request */}
      <PatientUsernameSearch onOpenPatientChart={(patientId) => setSelectedPatientId(patientId)} />

      {/* Main Section: Authorized Patient Roster */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" /> Authorized Patient Roster
            </h2>
            <p className="text-sm text-slate-600">Only patients with active consent appear here.</p>
          </div>

          {/* Search box within roster */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Filter authorized patients"
              placeholder="Filter patients by name or username…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Patient Cards / Table */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No authorized patients found. Use the Username Search above to find new patients and request access.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map(({ user, profile, allergies, conditions, records, consultations }) => {
              if (!user) return null;
              const severeAllergies = allergies.filter(
                (a) => a.severity === 'severe' || a.severity === 'life_threatening'
              );

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={
                        user.avatar_url ||
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                      }
                      alt={user.full_name}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{user.full_name}</h3>
                        <span className="font-mono text-xs text-slate-500">@{user.username}</span>
                        <span className="px-2 py-0.2 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          {profile?.blood_group || 'O+'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(profile?.date_of_birth)} ({profile?.gender})
                        </span>
                      </div>

                      {/* Clinical Summary Pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {severeAllergies.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Allergic to {severeAllergies.map((a) => a.allergen).join(', ')}
                          </span>
                        )}

                        {conditions.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                          >
                            <HeartPulse className="w-3 h-3 text-amber-600" />
                            {c.disease_name}
                          </span>
                        ))}

                        <span className="text-[11px] text-slate-400 font-medium">
                          {records.length} Documents • {consultations.length} Consultations
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedPatientId(user.id)}
                      className="btn-press flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-sky-400" />
                      Open Full Medical Chart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Affiliated Hospitals & Care Centers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600" /> Affiliated Hospital Facilities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {affiliations.map((aff) => {
            if (!aff.hospital) return null;
            return (
              <div
                key={aff.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{aff.hospital.name}</span>
                  {aff.is_primary && (
                    <span className="px-2 py-0.2 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-slate-500">{aff.hospital.address}, {aff.hospital.city}</p>
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                  <span className="font-semibold text-slate-900">Visiting Hours:</span>{' '}
                  {aff.visiting_hours || 'Mon-Fri 09:00 - 17:00'}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Emergency: {aff.hospital.emergency_helpline}</span>
                  <span className="font-semibold text-slate-700">Rating: {aff.hospital.rating} / 5.0</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Full Chart Modal */}
      {selectedPatientId && (
        <PatientChartModal
          isOpen={Boolean(selectedPatientId)}
          onClose={() => setSelectedPatientId(null)}
          patientId={selectedPatientId}
        />
      )}
    </div>
  );
};
