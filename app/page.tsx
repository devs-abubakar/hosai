'use client';

import React, { useEffect, useState } from 'react';
import { clearAuthenticatedProfile, setRemoteAuthenticatedProfile, useHosaiStore } from '@/lib/store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { AuthPage } from '@/components/auth/AuthPage';
import { PatientDashboard } from '@/components/patient/PatientDashboard';
import { PatientPassport } from '@/components/patient/PatientPassport';
import { DoctorDashboard } from '@/components/doctor/DoctorDashboard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { DoctorDiscovery } from '@/components/discovery/DoctorDiscovery';
import { HospitalDiscovery } from '@/components/discovery/HospitalDiscovery';
import { AiHealthAssistant } from '@/components/ai/AiHealthAssistant';
import { RecordUploadModal } from '@/components/patient/RecordUploadModal';
import { AppointmentManager } from '@/components/appointments/AppointmentManager';

export default function Home() {
  const { currentUser } = useHosaiStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | undefined>();
  const [remoteReady, setRemoteReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!active) return;
      if (!user) clearAuthenticatedProfile();
      else {
        const { data: profile } = await supabase!.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (profile && active) {
          const { data: patient } = profile.role === 'patient' ? await supabase!.from('patient_profiles').select('*').eq('id', user.id).maybeSingle() : { data: null };
          const { data: doctor } = profile.role === 'doctor' ? await supabase!.from('doctor_profiles').select('*').eq('id', user.id).maybeSingle() : { data: null };
          setRemoteAuthenticatedProfile(profile, patient ?? undefined, doctor ?? undefined);
        } else clearAuthenticatedProfile();
      }
      setRemoteReady(true);
    })();
    return () => { active = false; };
  }, []);

  // If user is not authenticated, render the dedicated Authentication Page
  if (!remoteReady) return <div className="min-h-screen bg-slate-50" aria-busy="true" />;
  if (!currentUser) {
    return <AuthPage />;
  }

  const renderContent = () => {
    // 1. Patient Role Views
    if (currentUser.role === 'patient') {
      if (activeTab === 'passport') {
        return <PatientPassport />;
      }
      if (activeTab === 'doctors') {
        return <DoctorDiscovery />;
      }
      if (activeTab === 'hospitals') {
        return <HospitalDiscovery />;
      }
      if (activeTab === 'appointments') return <AppointmentManager initialDoctorId={bookingDoctorId} />;
      return (
        <PatientDashboard
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenAiAssistant={() => setIsAiOpen(true)}
          onOpenUploadModal={() => setIsUploadOpen(true)}
        />
      );
    }

    // 2. Doctor Role Views
    if (currentUser.role === 'doctor') {
      if (activeTab === 'appointments') return <AppointmentManager initialDoctorId={bookingDoctorId} />;
      if (activeTab === 'hospitals') {
        return <HospitalDiscovery />;
      }
      if (activeTab === 'doctors') {
        return <DoctorDiscovery />;
      }
      return <DoctorDashboard />;
    }

    // 3. Admin Role Views
    if (currentUser.role === 'admin') {
      return <AdminDashboard />;
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation Bar with Role enforcement & Sign Out */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiAssistant={() => setIsAiOpen(true)}
      />

      {/* Main Role-Specific Viewport */}
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-3 text-sm font-semibold text-slate-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-sky-600"
      >
        Skip to main content
      </a>
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {renderContent()}
      </main>

      {/* Global Contextual Modals */}
      <AiHealthAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} onBookDoctor={(doctorId) => { setBookingDoctorId(doctorId); setActiveTab('appointments'); }} />
      <RecordUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        patientId={currentUser.id}
      />
    </div>
  );
}
