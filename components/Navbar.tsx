'use client';

import React from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  Activity,
  Bot,
  Building2,
  FileText,
  LogOut,
  Menu,
  Stethoscope,
  Users,
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
  const { currentUser, currentDoctorProfile, logout } = useHosaiStore();
  if (!currentUser) return null;

  const links = currentUser.role === 'patient'
    ? [
        { id: 'dashboard', label: 'Overview', icon: Activity },
        { id: 'passport', label: 'Medical Profile', icon: FileText },
        { id: 'doctors', label: 'Doctors', icon: Stethoscope },
        { id: 'hospitals', label: 'Hospitals', icon: Building2 },
      ]
    : currentUser.role === 'doctor'
      ? [
          { id: 'dashboard', label: 'Patients', icon: Users },
          { id: 'hospitals', label: 'Hospitals', icon: Building2 },
          { id: 'doctors', label: 'Colleagues', icon: Stethoscope },
        ]
      : [];

  const closeMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.currentTarget.closest('details')?.removeAttribute('open');
  };

  const navigate = (event: React.MouseEvent<HTMLButtonElement>, tab: string) => {
    setActiveTab(tab);
    closeMenu(event);
  };

  const initials = currentUser.full_name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  const signOut = (event: React.MouseEvent<HTMLButtonElement>) => {
    closeMenu(event);
    logout();
    toast.info('You have been signed out.');
  };

  const navigation = (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 lg:flex-row lg:items-center">
      {links.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={(event) => navigate(event, id)}
          aria-current={activeTab === id ? 'page' : undefined}
          className={`flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 lg:min-h-10 lg:text-[13px] ${
            activeTab === id
              ? 'bg-slate-100 text-slate-950'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
          }`}
        >
          <Icon aria-hidden="true" className="size-4 shrink-0 text-slate-500" />
          {label}
        </button>
      ))}
      {currentUser.role === 'admin' && (
        <span className="px-3 py-2 text-sm font-medium text-slate-600 lg:hidden">Platform management</span>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={(event) => navigate(event, 'dashboard')}
          aria-label="HOSAI home"
          className="flex shrink-0 items-center gap-2.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-sky-400">
            <Activity aria-hidden="true" className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-950">
            HOS<span className="text-sky-700">AI</span>
          </span>
        </button>

        <div className="hidden min-w-0 flex-1 lg:block">{navigation}</div>

        <div className="flex shrink-0 items-center gap-2">
          {currentUser.role === 'patient' && (
            <button
              type="button"
              onClick={onOpenAiAssistant}
              aria-label="Open AI health assistant"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:w-auto sm:gap-2 sm:px-3"
            >
              <Bot aria-hidden="true" className="size-4 text-sky-700" />
              <span className="hidden text-sm font-medium sm:inline">AI assistant</span>
            </button>
          )}

          <details name="header-menu" className="group relative">
            <summary
              aria-label="Open profile menu"
              className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden"
            >
              {initials || 'U'}
            </summary>
            <div className="absolute right-0 top-12 z-50 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">{currentUser.full_name}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">@{currentUser.username}</p>
                <p className="mt-1 break-all text-xs text-slate-500">{currentUser.email}</p>
                {currentUser.role === 'doctor' && currentDoctorProfile && (
                  <p className="mt-2 text-xs text-slate-600">
                    {currentDoctorProfile.specialization} · <span className="capitalize">{currentDoctorProfile.verification_status}</span>
                  </p>
                )}
                <p className="mt-2 text-[11px] font-medium capitalize text-slate-500">{currentUser.role} account</p>
              </div>
              {currentUser.role === 'patient' && (
                <button
                  type="button"
                  onClick={(event) => navigate(event, 'passport')}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                >
                  <FileText aria-hidden="true" className="size-4 text-slate-500" />
                  My Medical Profile
                </button>
              )}
              <button
                type="button"
                onClick={signOut}
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-rose-700 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
              >
                <LogOut aria-hidden="true" className="size-4" />
                Sign out
              </button>
            </div>
          </details>

          <details name="header-menu" className="relative lg:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open navigation menu</span>
            </summary>
            <div className="absolute right-0 top-12 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {navigation}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
};
