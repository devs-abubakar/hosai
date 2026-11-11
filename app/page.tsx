'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
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

export default function Home() {
  const { currentUser } = useHosaiStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // If user is not authenticated, render the dedicated Authentication Page
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderContent()}
      </main>

      {/* Global Contextual Modals */}
      <AiHealthAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <RecordUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        patientId={currentUser.id}
      />
    </div>
  );
}
