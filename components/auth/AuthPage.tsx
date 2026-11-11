'use client';

import React, { useState } from 'react';
import { useHosaiStore, DEMO_PASSWORD, DEMO_ADMIN_PASSWORD, setRemoteAuthenticatedProfile } from '@/lib/store';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { UserRole, BloodGroup } from '@/types/database';
import {
  Activity,
  UserCheck,
  Stethoscope,
  Shield,
  KeyRound,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export const AuthPage: React.FC = () => {
  const { login, registerUser } = useHosaiStore();
  const [activePortal, setActivePortal] = useState<UserRole>('patient');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Login form inputs
  const [loginIdentifier, setLoginIdentifier] = useState(isSupabaseConfigured ? '' : 'sarah@hosai.health');
  const [loginPassword, setLoginPassword] = useState(isSupabaseConfigured ? '' : DEMO_PASSWORD);

  // Registration inputs
  const [regRole, setRegRole] = useState<'patient' | 'doctor'>('patient');
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('Password123!');
  const [regPhone, setRegPhone] = useState('+1 (555) 019-2831');
  const [regLocation, setRegLocation] = useState('New York, NY');

  // Patient registration attributes
  const [regDob, setRegDob] = useState('1994-08-20');
  const [regBloodGroup, setRegBloodGroup] = useState<BloodGroup>('O+');
  const [regEmergencyName, setRegEmergencyName] = useState('David Jenkins');
  const [regEmergencyPhone, setRegEmergencyPhone] = useState('+1 (555) 991-0021');

  // Doctor registration attributes
  const [regSpecialization, setRegSpecialization] = useState('Endocrinology');
  const [regLicense, setRegLicense] = useState('MED-NY-74892');
  const [regExperience, setRegExperience] = useState(6);
  const [regFee, setRegFee] = useState(140);

  // Switch Portal Tab
  const handlePortalChange = (role: UserRole) => {
    setActivePortal(role);
    setErrorMessage(null);
    setIsRegistering(false);

    if (role === 'patient') {
      setLoginIdentifier(isSupabaseConfigured ? '' : 'sarah@hosai.health');
      setLoginPassword(isSupabaseConfigured ? '' : DEMO_PASSWORD);
    } else if (role === 'doctor') {
      setLoginIdentifier(isSupabaseConfigured ? '' : 'marcus.vance@hosai.health');
      setLoginPassword(isSupabaseConfigured ? '' : DEMO_PASSWORD);
    } else {
      setLoginIdentifier(isSupabaseConfigured ? '' : 'admin@hosai.health');
      setLoginPassword(isSupabaseConfigured ? '' : DEMO_ADMIN_PASSWORD);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginIdentifier.trim(), password: loginPassword });
      if (error || !data.user) {
        const message = error?.message || 'Authentication failed.';
        setErrorMessage(message); toast.error(message); return;
      }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profileError || !profile || profile.role !== activePortal) {
        await supabase.auth.signOut();
        const message = profileError?.message || 'Choose the portal that matches your account.';
        setErrorMessage(message); toast.error(message); return;
      }
      const { data: patient } = profile.role === 'patient' ? await supabase.from('patient_profiles').select('*').eq('id', profile.id).maybeSingle() : { data: null };
      const { data: doctor } = profile.role === 'doctor' ? await supabase.from('doctor_profiles').select('*').eq('id', profile.id).maybeSingle() : { data: null };
      setRemoteAuthenticatedProfile(profile, patient ?? undefined, doctor ?? undefined);
      toast.success('Signed in securely');
      return;
    }
    const res = login(loginIdentifier, loginPassword, activePortal);
    if (!res.success) {
      setErrorMessage(res.error || 'Authentication failed.');
      toast.error(res.error || 'Login failed');
    } else {
      toast.success('Authentication verified', {
        description: `Redirecting to your ${activePortal} dashboard.`,
      });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFullName.trim() || !regUsername.trim() || !regEmail.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(), password: regPassword,
        options: { data: {
          role: regRole, username: regUsername.trim().toLowerCase(), full_name: regFullName.trim(), phone: regPhone,
          location: regLocation, date_of_birth: regDob, blood_group: regBloodGroup,
          gender: 'female', emergency_contact_name: regEmergencyName,
          emergency_contact_phone: regEmergencyPhone, emergency_contact_relation: 'Family',
          specialization: regSpecialization, qualifications: ['MBBS', 'Board Certified'],
          experience_years: regExperience, registration_number: regLicense,
          consultation_fee: regFee, bio: `Clinical practitioner specializing in ${regSpecialization}.`,
        } },
      });
      if (error) { setErrorMessage(error.message); toast.error(error.message); return; }
      if (data.user && data.session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        const { data: patient } = regRole === 'patient' ? await supabase.from('patient_profiles').select('*').eq('id', data.user.id).maybeSingle() : { data: null };
        const { data: doctor } = regRole === 'doctor' ? await supabase.from('doctor_profiles').select('*').eq('id', data.user.id).maybeSingle() : { data: null };
        if (profile) setRemoteAuthenticatedProfile(profile, patient ?? undefined, doctor ?? undefined);
      }
      toast.success(data.session ? 'Registration complete' : 'Check your email to confirm your account', {
        description: regRole === 'doctor' ? 'Doctor accounts remain pending until verified by an administrator.' : undefined,
      });
      setIsRegistering(false);
      return;
    }
    const res = registerUser(
      {
        email: regEmail,
        username: regUsername,
        password: regPassword,
        full_name: regFullName,
        phone: regPhone,
        role: regRole,
        location: regLocation,
      },
      regRole === 'patient'
        ? {
            date_of_birth: regDob,
            blood_group: regBloodGroup,
            gender: 'female',
            emergency_contact_name: regEmergencyName,
            emergency_contact_phone: regEmergencyPhone,
            emergency_contact_relation: 'Family',
          }
        : undefined,
      regRole === 'doctor'
        ? {
            specialization: regSpecialization,
            qualifications: ['MBBS', 'Board Certified'],
            experience_years: regExperience,
            registration_number: regLicense,
            consultation_fee: regFee,
            bio: `Clinical practitioner specializing in ${regSpecialization}.`,
          }
        : undefined
    );

    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
      toast.error(res.error || 'Registration failed');
    } else {
      toast.success('Registration complete', {
        description:
          regRole === 'doctor'
            ? 'Your doctor account has been submitted for administrative verification.'
            : 'Welcome to your HOSAI medical passport.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-sm mb-3">
          <Activity className="w-6 h-6 text-sky-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          HOS<span className="text-sky-600">AI</span> Healthcare Platform
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Centralized Medical Passport &amp; Clinical Management
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          {/* Portal Selector Tabs */}
          {!isRegistering && (
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => handlePortalChange('patient')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activePortal === 'patient'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                Patient
              </button>

              <button
                type="button"
                onClick={() => handlePortalChange('doctor')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activePortal === 'doctor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                Doctor
              </button>

              <button
                type="button"
                onClick={() => handlePortalChange('admin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activePortal === 'admin'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                Admin
              </button>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {isSupabaseConfigured ? 'Account email' : activePortal === 'patient'
                    ? 'Patient Email or @username'
                    : activePortal === 'doctor'
                    ? 'Physician Email or @username'
                    : 'Administrator Email or @username'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={isSupabaseConfigured ? 'email' : 'text'}
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder={isSupabaseConfigured ? 'Enter your account email' : 'Enter email or username...'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-press w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors"
              >
                <span>Sign In to {activePortal.charAt(0).toUpperCase() + activePortal.slice(1)} Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* DEMO TEST ACCOUNTS HELPER BOX */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Demo Test Credentials</span>
                  <span className="text-[10px] text-slate-400 font-mono">[DEMO ONLY]</span>
                </div>

                {activePortal === 'patient' && (
                  <div className="space-y-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('sarah@hosai.health');
                        setLoginPassword(DEMO_PASSWORD);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">Sarah Jenkins (@sarah_jenkins)</div>
                        <div className="text-[11px] text-slate-500">sarah@hosai.health • Hypertension &amp; Allergies</div>
                      </div>
                      <span className="text-[10px] text-sky-600 font-medium">Use</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('robert@hosai.health');
                        setLoginPassword(DEMO_PASSWORD);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">Robert Chen (@robert_chen)</div>
                        <div className="text-[11px] text-slate-500">robert@hosai.health • Type 2 Diabetes</div>
                      </div>
                      <span className="text-[10px] text-sky-600 font-medium">Use</span>
                    </button>
                  </div>
                )}

                {activePortal === 'doctor' && (
                  <div className="space-y-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('marcus.vance@hosai.health');
                        setLoginPassword(DEMO_PASSWORD);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">Dr. Marcus Vance (@dr_vance)</div>
                        <div className="text-[11px] text-slate-500">marcus.vance@hosai.health • Cardiologist (Verified)</div>
                      </div>
                      <span className="text-[10px] text-sky-600 font-medium">Use</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('priya.sharma@hosai.health');
                        setLoginPassword(DEMO_PASSWORD);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">Dr. Priya Sharma (@dr_sharma)</div>
                        <div className="text-[11px] text-slate-500">priya.sharma@hosai.health • Neurologist (Verified)</div>
                      </div>
                      <span className="text-[10px] text-sky-600 font-medium">Use</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('james.wilson@hosai.health');
                        setLoginPassword(DEMO_PASSWORD);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">Dr. James Wilson (@dr_wilson)</div>
                        <div className="text-[11px] text-slate-500">james.wilson@hosai.health • Family Med (Pending)</div>
                      </div>
                      <span className="text-[10px] text-sky-600 font-medium">Use</span>
                    </button>
                  </div>
                )}

                {activePortal === 'admin' && (
                  <div className="space-y-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginIdentifier('admin@hosai.health');
                        setLoginPassword(DEMO_ADMIN_PASSWORD);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800">Elena Rostova (@admin_elena)</div>
                        <div className="text-[11px] text-slate-500">admin@hosai.health • Health Administrator</div>
                      </div>
                      <span className="text-[10px] text-sky-600 font-medium">Use</span>
                    </button>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 mt-2 text-center">
                  Password for demo accounts: <span className="font-mono text-slate-600">Password123!</span>
                </div>
              </div>

              {/* Registration Toggle */}
              {activePortal !== 'admin' && (
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole(activePortal === 'doctor' ? 'doctor' : 'patient');
                      setIsRegistering(true);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                  >
                    Don&apos;t have an account? Register as a {activePortal === 'doctor' ? 'Doctor' : 'Patient'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Register as {regRole === 'patient' ? 'Patient' : 'Doctor'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Back to Sign In
                </button>
              </div>

              {/* Role Toggle for Registration */}
              <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRegRole('patient')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${
                    regRole === 'patient' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('doctor')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md ${
                    regRole === 'doctor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Doctor
                </button>
              </div>

              {regRole === 'doctor' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                  <span className="font-bold">Medical Council Notice:</span> Doctor registrations are
                  held in &quot;Pending&quot; verification status until credentials and license numbers
                  are audited by an administrator.
                </div>
              )}

              <div className="grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                    Username *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">@</span>
                    <input
                      type="text"
                      required
                      placeholder="jane_doe"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* Conditional Patient Fields */}
              {regRole === 'patient' && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Blood Group
                      </label>
                      <select
                        value={regBloodGroup}
                        onChange={(e) => setRegBloodGroup(e.target.value as BloodGroup)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={regEmergencyName}
                        onChange={(e) => setRegEmergencyName(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Emergency Phone
                      </label>
                      <input
                        type="text"
                        value={regEmergencyPhone}
                        onChange={(e) => setRegEmergencyPhone(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Doctor Fields */}
              {regRole === 'doctor' && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                  <div className="grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={regSpecialization}
                        onChange={(e) => setRegSpecialization(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Medical License #
                      </label>
                      <input
                        type="text"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 min-[440px]:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        value={regExperience}
                        onChange={(e) => setRegExperience(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase">
                        Fee ($ USD)
                      </label>
                      <input
                        type="number"
                        value={regFee}
                        onChange={(e) => setRegFee(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn-press w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors"
              >
                Complete {regRole === 'doctor' ? 'Doctor' : 'Patient'} Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
