'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  Search,
  Stethoscope,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export const DoctorDiscovery: React.FC = () => {
  const { state, currentUser, grantDoctorAccess, revokeDoctorAccess } = useHosaiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  if (!currentUser) return null;

  const specialties = [
    'all',
    'Cardiology',
    'Neurology',
    'Family Medicine',
    'Emergency Medicine',
    'Pediatrics',
  ];

  const doctors = state.doctorProfiles.map((doc) => {
    const user = state.profiles.find((p) => p.id === doc.id);
    const affiliations = state.doctorHospitals
      .filter((dh) => dh.doctor_id === doc.id)
      .map((dh) => state.hospitals.find((h) => h.id === dh.hospital_id))
      .filter(Boolean);

    // Check if current user (patient) has granted access to this doctor
    const isAccessGranted = state.patientDoctorAccess.some(
      (a) => a.patient_id === currentUser.id && a.doctor_id === doc.id && a.access_status === 'active'
    );

    return {
      doc,
      user,
      affiliations,
      isAccessGranted,
    };
  });

  const filteredDoctors = doctors.filter(({ doc, user }) => {
    const matchesSearch =
      (user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.location?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;

    const matchesSpecialty =
      selectedSpecialty === 'all' || doc.specialization === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const handleToggleAccess = (doctorId: string, doctorName: string, isCurrentlyGranted: boolean) => {
    if (isCurrentlyGranted) {
      revokeDoctorAccess(currentUser.id, doctorId);
      toast.info(`Revoked medical record access for ${doctorName}`);
    } else {
      grantDoctorAccess(currentUser.id, doctorId);
      toast.success(`Granted record access to ${doctorName}`, {
        description: 'Doctor can now review your continuous medical passport.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-sky-600" />
            Find &amp; Authorize Qualified Doctors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified medical board specialists and grant explicit access to your medical passport.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doctor name, specialty, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedSpecialty === spec
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec === 'all' ? 'All Specialties' : spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(({ doc, user, affiliations, isAccessGranted }) => {
          if (!user) return null;
          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  <img
                    src={
                      user.avatar_url ||
                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
                    }
                    alt={user.full_name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-sm">{user.full_name}</h3>
                      <span className="font-mono text-[11px] text-slate-400">@{user.username}</span>
                      {doc.verification_status === 'verified' && (
                        <span title="Verified by Medical Board">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                      {doc.specialization}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {doc.experience_years} years exp • Fee: ${doc.consultation_fee}
                    </p>
                    <p className="text-[11px] text-slate-400">License: {doc.registration_number}</p>
                  </div>
                </div>

                {doc.bio && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mt-3 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>
                )}

                {/* Hospital Affiliations */}
                {affiliations.length > 0 && (
                  <div className="mt-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">
                      Hospital Affiliation:
                    </span>
                    {affiliations.map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-sky-500" />
                        {h?.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient Authorization Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isAccessGranted ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Authorized
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Records Private
                    </span>
                  )}
                </span>

                {currentUser.role === 'patient' && (
                  <button
                    onClick={() => handleToggleAccess(doc.id, user.full_name, isAccessGranted)}
                    className={`btn-press flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                      isAccessGranted
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isAccessGranted ? (
                      <>
                        <Lock className="w-3 h-3" /> Revoke Access
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Grant Access
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
