'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  Search,
  UserCheck,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface PatientUsernameSearchProps {
  onOpenPatientChart: (patientId: string) => void;
}

export const PatientUsernameSearch: React.FC<PatientUsernameSearchProps> = ({
  onOpenPatientChart,
}) => {
  const { searchPatientByUsername, requestPatientAccess, currentUser } = useHosaiStore();
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ReturnType<typeof searchPatientByUsername>>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setSearchResult(null);
      setHasSearched(false);
      return;
    }

    const result = searchPatientByUsername(query.trim());
    setSearchResult(result);
    setHasSearched(true);
    setShowNoteInput(false);
  };

  const handleSendRequest = () => {
    if (!currentUser || !searchResult?.user) return;

    const res = requestPatientAccess(
      currentUser.id,
      searchResult.user.id,
      requestNote || 'Clinical consultation evaluation request'
    );

    if (res.success) {
      toast.success('Access Request Sent', {
        description: `Patient @${searchResult.user.username} has been notified to authorize your access.`,
      });
      // Refresh search result
      setSearchResult(searchPatientByUsername(searchResult.user.username));
      setShowNoteInput(false);
      setRequestNote('');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-600" />
            Find Patient by Unique Username
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Search patients using their assigned username to request or view clinical medical records.
          </p>
        </div>

        {/* Quick Demo Search Hints */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="text-[11px] font-medium text-slate-400">Quick Try:</span>
          <button
            type="button"
            onClick={() => {
              setQuery('sarah_jenkins');
              const res = searchPatientByUsername('sarah_jenkins');
              setSearchResult(res);
              setHasSearched(true);
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
          >
            @sarah_jenkins (Authorized)
          </button>
          <button
            type="button"
            onClick={() => {
              setQuery('robert_chen');
              const res = searchPatientByUsername('robert_chen');
              setSearchResult(res);
              setHasSearched(true);
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
          >
            @robert_chen (Requires Access)
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
            @
          </span>
          <input
            type="text"
            placeholder="Enter exact patient username (e.g. robert_chen)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) {
                setSearchResult(null);
                setHasSearched(false);
              }
            }}
            className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
          />
        </div>
        <button
          type="submit"
          className="btn-press px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          Search
        </button>
      </form>

      {/* Result Display */}
      {hasSearched && (
        <div className="pt-2">
          {!searchResult ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>No patient account found with username &quot;@{query}&quot;. Verify the spelling.</span>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      searchResult.user.avatar_url ||
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                    }
                    alt={searchResult.user.full_name}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-white shadow-xs shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {searchResult.user.full_name}
                      </span>
                      <span className="font-mono text-xs text-slate-500 font-medium">
                        @{searchResult.user.username}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                        {searchResult.profile?.blood_group || 'O+'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Location: {searchResult.user.location || 'New York, NY'} • Emergency Contact:{' '}
                      {searchResult.profile?.emergency_contact_name || 'Recorded'}
                    </p>
                  </div>
                </div>

                {/* Status & Primary Action */}
                <div className="flex items-center gap-2 shrink-0">
                  {searchResult.accessStatus === 'active' && (
                    <button
                      onClick={() => onOpenPatientChart(searchResult.user.id)}
                      className="btn-press flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Open Full Medical Chart
                    </button>
                  )}

                  {searchResult.accessStatus === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Access Request Pending
                    </span>
                  )}

                  {(searchResult.accessStatus === 'none' ||
                    searchResult.accessStatus === 'rejected' ||
                    searchResult.accessStatus === 'revoked') && (
                    <button
                      onClick={() => setShowNoteInput(!showNoteInput)}
                      className="btn-press flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Request Access
                    </button>
                  )}
                </div>
              </div>

              {/* Status explanation */}
              <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  {searchResult.accessStatus === 'active' ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      You have full verified authorization to review this patient&apos;s medical history.
                    </span>
                  ) : searchResult.accessStatus === 'pending' ? (
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Your request is awaiting patient review. Records remain locked until authorized.
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Medical history protected under Supabase RLS. You cannot view diagnostic records without patient consent.
                    </span>
                  )}
                </div>
              </div>

              {/* Note input drawer if doctor clicked Request Access */}
              {showNoteInput && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 mt-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">
                    Clinical Note / Justification to Patient
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Requested for Cardiology assessment and diagnostic review..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendRequest}
                      className="btn-press px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Submit Access Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
