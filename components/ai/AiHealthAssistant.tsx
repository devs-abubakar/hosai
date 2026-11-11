'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bot, LoaderCircle, Send, User, X } from 'lucide-react';
import { useHosaiStore } from '@/lib/store';

type Message = { role: 'user' | 'assistant'; text: string };
type Recommendation = { id: string; specialization: string; qualifications: string[]; experience_years: number; profile: { full_name: string; location: string | null }; slots: { id: string; starts_at: string }[] };

export function AiHealthAssistant({ isOpen, onClose, onBookDoctor }: { isOpen: boolean; onClose: () => void; onBookDoctor?: (doctorId: string) => void }) {
  const { currentUser, state, isDemoMode } = useHosaiStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy]);
  if (!isOpen || !currentUser || currentUser.role !== 'patient') return null;

  const send = async (value: string) => {
    const text = value.trim();
    if (!text || busy) return;
    const previous = messages;
    const summary = /summari[sz]|history|condition|symptom|pain/i.test(text);
    const reportQuery = /report|test result|lab|scan/i.test(text);
    const medicationQuery = /medication|medicine|prescription|dose|drug|treatment plan/i.test(text);
    const appointmentQuery = /appointment/i.test(text);
    const doctorQuery = /doctor|specialist|specialty|appointment|clinic|hospital/i.test(text);
    setMessages((items) => [...items, { role: 'user', text }]); setInput(''); setBusy(true); setError(''); setRecommendations([]);
    try {
      const response = await fetch('/api/ai/health', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: previous.slice(-6),
          demoMode: isDemoMode,
          ...(isDemoMode ? {
            demoContext: {
              conditions: summary ? state.medicalConditions.filter((item) => item.patient_id === currentUser.id).slice(0, 12).map(({ disease_name, description, status, diagnosed_date }) => ({ disease_name, description, status, diagnosed_date })) : [],
              allergies: state.allergies.filter((item) => item.patient_id === currentUser.id).map(({ allergen, reaction, severity, notes }) => ({ allergen, reaction, severity, notes })),
              medications: state.medications.filter((item) => item.patient_id === currentUser.id && item.status === 'active').slice(0, medicationQuery || summary ? 15 : 5).map(({ medication_name, dosage, frequency, duration, status }) => ({ medication_name, dosage, frequency, duration, status })),
              reports: reportQuery ? state.medicalRecords.filter((item) => item.patient_id === currentUser.id).slice(0, 5).map(({ title, record_type, record_date, notes }) => ({ title, record_type, record_date, notes })) : [],
              consultations: summary || /consultation|visit/i.test(text) ? state.consultations.filter((item) => item.patient_id === currentUser.id).slice(0, 5).map(({ consultation_date, symptoms, observations, diagnosis, clinical_notes, treatment_plan }) => ({ consultation_date, symptoms, observations, diagnosis, clinical_notes, treatment_plan })) : [],
              prescriptions: medicationQuery ? state.prescriptions.filter((item) => item.patient_id === currentUser.id).slice(0, 5).map(({ prescription_date, general_instructions, items }) => ({ prescription_date, general_instructions, items })) : [],
              appointments: appointmentQuery ? state.appointments.filter((item) => item.patient_id === currentUser.id).slice(0, 10) : [],
            },
            demoDoctors: doctorQuery ? state.doctorProfiles.filter((doctor) => doctor.verification_status === 'verified').map((doctor) => ({
              id: doctor.id, specialization: doctor.specialization, qualifications: doctor.qualifications,
              experience_years: doctor.experience_years,
              profile: {
                full_name: state.profiles.find((profile) => profile.id === doctor.id)?.full_name ?? 'Doctor',
                location: state.profiles.find((profile) => profile.id === doctor.id)?.location ?? null,
              },
              slots: state.doctorAvailability.filter((slot) => slot.doctor_id === doctor.id && slot.status === 'available' && new Date(slot.starts_at).getTime() > Date.now()).slice(0, 3).map(({ id, starts_at }) => ({ id, starts_at })),
            })).filter((doctor) => doctor.slots.length > 0) : [],
          } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The assistant could not answer right now.');
      setMessages((items) => [...items, { role: 'assistant', text: data.answer }]);
      setRecommendations(data.recommendations ?? []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The assistant could not answer right now.'); }
    finally { setBusy(false); }
  };

  const suggestions = ['Summarize my medical history', 'Help me find the right specialist', 'Show my upcoming appointments', 'Explain my latest medical report', 'Help me prepare for a consultation'];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="assistant-title" className="flex h-[min(720px,100dvh)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:h-[min(720px,calc(100dvh-2rem))] sm:rounded-2xl">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-800"><Bot size={19}/></span><div><h2 id="assistant-title" className="font-semibold text-slate-900">HOSAI health assistant</h2><p className="text-xs text-slate-500">{isDemoMode ? 'Demo mode · sample records only' : 'Your records are retrieved securely for each question'}</p></div></div>
        <button onClick={onClose} aria-label="Close assistant" className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"><X size={18}/></button>
      </header>
      <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs leading-relaxed text-amber-950 sm:px-5"><AlertTriangle size={15} className="mt-0.5 shrink-0"/><p>For information and care preparation only. This assistant does not diagnose or prescribe. For urgent symptoms, contact emergency services.</p></div>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {messages.length === 0 && <div className="mx-auto max-w-lg py-5"><h3 className="text-lg font-semibold text-slate-900">What can I help you with?</h3><p className="mt-1 text-sm text-slate-600">Ask about information in your HOSAI records or getting ready for care.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{suggestions.map((prompt) => <button key={prompt} onClick={() => void send(prompt)} className="min-h-11 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">{prompt}</button>)}</div></div>}
        <div className="space-y-4">{messages.map((message, index) => <div key={`${index}-${message.role}`} className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${message.role === 'user' ? 'bg-slate-900 text-white' : 'bg-sky-50 text-sky-800'}`}>{message.role === 'user' ? <User size={15}/> : <Bot size={16}/>}</span>
          <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>{message.text}</p>
        </div>)}</div>
        {busy && <div className="mt-4 flex items-center gap-2 text-sm text-slate-500" role="status"><LoaderCircle size={16} className="animate-spin"/>Reviewing your question…</div>}
        {recommendations.length > 0 && <div className="mt-4 space-y-2"><h3 className="text-sm font-semibold text-slate-900">Verified doctors with available times</h3>{recommendations.map((doctor) => <article key={doctor.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-slate-900">{doctor.profile.full_name}</p><p className="text-sm text-slate-600">{doctor.specialization} · {doctor.experience_years} years experience</p><p className="text-xs text-slate-500">Next available: {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(doctor.slots[0].starts_at))}</p></div><button onClick={() => { onClose(); onBookDoctor?.(doctor.id); }} className="min-h-10 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white">View times</button></article>)}</div>}
        {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
      </div>
      <form onSubmit={(event: FormEvent) => { event.preventDefault(); void send(input); }} className="flex gap-2 border-t border-slate-200 bg-white p-3 sm:p-4">
        <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={1500} placeholder="Ask about your care or records" aria-label="Message the health assistant" disabled={busy} className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700" />
        <button type="submit" disabled={busy || !input.trim()} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"><Send size={16}/><span className="hidden sm:inline">Send</span></button>
      </form>
    </section>
  </div>;
}
