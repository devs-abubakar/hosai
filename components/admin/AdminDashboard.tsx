'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  ShieldCheck,
  Users,
  Building2,
  Stethoscope,
  Activity,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { AddHospitalModal } from './AddHospitalModal';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const {
    state,
    currentUser,
    setDoctorVerificationStatus,
    removeHospital,
  } = useHosaiStore();

  const [activeTab, setActiveTab] = useState<'verifications' | 'hospitals' | 'users'>('verifications');
  const [showAddHospital, setShowAddHospital] = useState(false);

  if (!currentUser) return null;

  const totalPatients = state.profiles.filter((p) => p.role === 'patient').length;
  const totalDoctors = state.doctorProfiles.length;
  const pendingDoctors = state.doctorProfiles.filter((d) => d.verification_status === 'pending');
  const verifiedDoctors = state.doctorProfiles.filter((d) => d.verification_status === 'verified');
  const totalHospitals = state.hospitals.length;
  const totalConsultations = state.consultations.length;

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Platform Regulatory &amp; Admin Console
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Hospital Operations &amp; Verification
            </h1>
            <p className="text-slate-500 text-xs">
              Administrator: <span className="font-semibold text-slate-800">{currentUser.full_name}</span> (@{currentUser.username}) • Auditing
              practitioner licensing, hospital registrations, and healthcare compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xl font-bold text-amber-700">{pendingDoctors.length}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Pending Licensure
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xl font-bold text-slate-900">{totalHospitals}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Verified Facilities
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Patients</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPatients}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active encrypted medical passports</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered Doctors</span>
            <Stethoscope className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalDoctors}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {verifiedDoctors.length} verified, {pendingDoctors.length} pending review
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Hospitals</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalHospitals}</div>
          <div className="text-[11px] text-slate-400 mt-1">Verified partner clinics &amp; trauma centers</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Consultations</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalConsultations}</div>
          <div className="text-[11px] text-slate-400 mt-1">Official clinical notes logged</div>
        </div>
      </div>

      {/* Main Admin Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('verifications')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'verifications'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Doctor Verification Queue
              {pendingDoctors.length > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500 text-slate-950 font-bold">
                  {pendingDoctors.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Hospital Directory ({totalHospitals})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              User Accounts ({state.profiles.length})
            </button>
          </div>

          {activeTab === 'hospitals' && (
            <button
              onClick={() => setShowAddHospital(true)}
              className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Hospital
            </button>
          )}
        </div>

        {/* TAB 1: DOCTOR VERIFICATION QUEUE */}
        {activeTab === 'verifications' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Medical Council Credential &amp; Licensure Verification
              </h3>
              <p className="text-xs text-slate-500">
                Verify physician credentials before authorizing clinical practice on patient passports.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4">Medical License #</th>
                    <th className="py-3 px-4">Experience</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.doctorProfiles.map((doc) => {
                    const user = state.profiles.find((p) => p.id === doc.id);
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                user?.avatar_url ||
                                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
                              }
                              alt={user?.full_name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{user?.full_name}</div>
                              <div className="text-[11px] font-mono text-slate-500">@{user?.username} • {user?.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-slate-800">{doc.specialization}</td>
                        <td className="py-3 px-4 font-mono text-slate-700 font-medium">{doc.registration_number}</td>
                        <td className="py-3 px-4 text-slate-600">{doc.experience_years} years</td>

                        <td className="py-3 px-4">
                          {doc.verification_status === 'verified' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                          {doc.verification_status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Review
                            </span>
                          )}
                          {doc.verification_status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {doc.verification_status !== 'verified' && (
                              <button
                                onClick={() => {
                                  setDoctorVerificationStatus(doc.id, 'verified');
                                  toast.success(`Verified: ${user?.full_name}`, {
                                    description: 'Doctor credentials authorized for clinical practice.',
                                  });
                                }}
                                className="btn-press flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold shadow-xs transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Verify
                              </button>
                            )}

                            {doc.verification_status !== 'rejected' && (
                              <button
                                onClick={() => {
                                  setDoctorVerificationStatus(doc.id, 'rejected');
                                  toast.error(`Rejected credentials for ${user?.full_name}`);
                                }}
                                className="btn-press flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: HOSPITALS MANAGEMENT */}
        {activeTab === 'hospitals' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hospital &amp; Healthcare Facility Registry</h3>
              <p className="text-xs text-slate-500">
                Registered healthcare institutions, verified clinical departments, and 24/7 emergency helplines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{hosp.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        Rating: {hosp.rating} / 5.0
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {hosp.address}, {hosp.city}, {hosp.state}
                    </p>
                    <div className="text-xs text-slate-700 mt-2">
                      <span className="font-semibold">Phone:</span> {hosp.contact_phone}
                    </div>
                    <div className="text-xs text-rose-700 font-medium">
                      <span className="font-semibold">Emergency:</span> {hosp.emergency_helpline}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {hosp.departments.slice(0, 4).map((dept, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Verified Facility</span>
                    <button
                      onClick={() => {
                        removeHospital(hosp.id);
                        toast.info(`Removed hospital listing: ${hosp.name}`);
                      }}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">System User Accounts</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.profiles.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                        <img
                          src={
                            user.avatar_url ||
                            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                          }
                          alt={user.full_name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div>{user.full_name}</div>
                          <div className="text-[11px] font-mono text-slate-400 font-normal">
                            @{user.username} • {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'doctor'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : user.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{user.location || '—'}</td>
                      <td className="py-3 px-4 text-slate-600">{user.phone || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Hospital Modal */}
      <AddHospitalModal isOpen={showAddHospital} onClose={() => setShowAddHospital(false)} />
    </div>
  );
};
