'use client';

import React from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Building2,
  Bot,
  FileText,
  Users,
  LogOut,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAiAssistant,
}) => {
  const { currentUser, logout } = useHosaiStore();

  if (!currentUser) return null;

  const handleSignOut = () => {
    logout();
    toast.info('You have been signed out.');
  };

  const getNavLinks = () => {
    if (currentUser.role === 'patient') {
      return [
        { id: 'dashboard', label: 'My Health Hub', icon: Activity },
        { id: 'passport', label: 'Medical Passport', icon: FileText },
        { id: 'doctors', label: 'Find Doctors', icon: Stethoscope },
        { id: 'hospitals', label: 'Hospitals', icon: Building2 },
      ];
    }
    if (currentUser.role === 'doctor') {
      return [
        { id: 'dashboard', label: 'Clinical Dashboard', icon: Activity },
        { id: 'patients', label: 'Authorized Patients', icon: Users },
        { id: 'hospitals', label: 'Hospital Network', icon: Building2 },
        { id: 'doctors', label: 'Colleague Directory', icon: Stethoscope },
      ];
    }
    // Admin
    return [
      { id: 'dashboard', label: 'Overview & Stats', icon: Activity },
      { id: 'verifications', label: 'Doctor Verification', icon: ShieldCheck },
      { id: 'hospitals', label: 'Hospital Directory', icon: Building2 },
      { id: 'users', label: 'User Management', icon: Users },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Activity className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    HOS<span className="text-sky-600">AI</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Health OS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Unified Medical Records</p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right actions: AI Assistant & User Sign Out */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAiAssistant}
              className="btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">AI Health Assistant</span>
            </button>

            {/* Active User info badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={
                  currentUser.avatar_url ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                }
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-slate-900 leading-tight">
                  {currentUser.full_name}
                </div>
                <div className="text-slate-400 text-[10px] font-mono">
                  @{currentUser.username} • <span className="capitalize">{currentUser.role}</span>
                </div>
              </div>

              {/* Secure Sign Out Button */}
              <button
                onClick={handleSignOut}
                title="Sign out of your session"
                className="btn-press p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
