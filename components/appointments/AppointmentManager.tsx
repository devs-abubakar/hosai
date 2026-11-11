'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { CalendarClock, Check, Clock3, LoaderCircle, Plus, X } from 'lucide-react';
import { useHosaiStore } from '@/lib/store';
import type { AppointmentStatus } from '@/types/database';

type Appointment = {
  id: string; patient_id: string; doctor_id: string; slot_id: string; starts_at: string; ends_at: string;
  appointment_type: 'in_person' | 'online'; reason: string | null; status: AppointmentStatus;
  patient_name: string; patient_username: string; doctor_name: string; doctor_username: string; specialization: string;
};
type Doctor = { id: string; specialization: string; qualifications: string[]; experience_years: number; bio: string | null; consultation_fee: number; profiles: { full_name: string; username: string; location: string | null } };
type Slot = { id: string; doctor_id: string; starts_at: string; ends_at: string };

const prettyDate = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const labels: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', rejected: 'Rejected', cancelled: 'Cancelled', completed: 'Completed' };

export function AppointmentManager({ initialDoctorId }: { initialDoctorId?: string }) {
  const { currentUser, currentDoctorProfile, state, isDemoMode, addDemoAvailability, removeDemoAvailability, bookDemoAppointment, updateDemoAppointment } = useHosaiStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [doctorVerified, setDoctorVerified] = useState(false);
  const [doctorId, setDoctorId] = useState(initialDoctorId ?? '');
  const [slotId, setSlotId] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in_person' | 'online'>('in_person');
  const [reason, setReason] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState(0);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (isDemoMode && currentUser) {
      const currentAppointments = state.appointments.filter((item) => currentUser.role === 'patient'
        ? item.patient_id === currentUser.id : item.doctor_id === currentUser.id);
      setAppointments(currentAppointments.map((item) => ({
        ...item,
        patient_name: state.profiles.find((profile) => profile.id === item.patient_id)?.full_name ?? 'Patient',
        patient_username: state.profiles.find((profile) => profile.id === item.patient_id)?.username ?? '',
        doctor_name: state.profiles.find((profile) => profile.id === item.doctor_id)?.full_name ?? 'Doctor',
        doctor_username: state.profiles.find((profile) => profile.id === item.doctor_id)?.username ?? '',
        specialization: state.doctorProfiles.find((profile) => profile.id === item.doctor_id)?.specialization ?? 'Healthcare',
      })));
      setDoctors(state.doctorProfiles.filter((doctor) => doctor.verification_status === 'verified').map((doctor) => ({
        ...doctor, bio: doctor.bio ?? null,
        profiles: {
          full_name: state.profiles.find((profile) => profile.id === doctor.id)?.full_name ?? 'Doctor',
          username: state.profiles.find((profile) => profile.id === doctor.id)?.username ?? '',
          location: state.profiles.find((profile) => profile.id === doctor.id)?.location ?? null,
        },
      })));
      setSlots(state.doctorAvailability.filter((slot) => slot.status === 'available'
        && new Date(slot.starts_at).getTime() > Date.now()
        && (currentUser.role === 'patient' || slot.doctor_id === currentUser.id)));
      setDoctorVerified(currentDoctorProfile?.verification_status === 'verified');
      setLoadedAt(Date.now()); setLoading(false); setError('');
      return;
    }
    try {
      const response = await fetch('/api/appointments', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load appointments.');
      setAppointments(data.appointments ?? []); setDoctors(data.doctors ?? []); setSlots(data.slots ?? []);
      setDoctorVerified(Boolean(data.doctorVerified));
      setLoadedAt(Date.now());
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load appointments.'); }
    finally { setLoading(false); }
  }, [currentDoctorProfile?.verification_status, currentUser, isDemoMode, state]);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);

  const selectedSlots = slots.filter((slot) => slot.doctor_id === doctorId);
  const selectedDoctor = doctors.find((doctor) => doctor.id === doctorId);
  const availableDoctors = doctors.filter((doctor) => slots.some((slot) => slot.doctor_id === doctor.id));
  const upcoming = appointments.filter((a) => ['pending', 'confirmed'].includes(a.status) && new Date(a.starts_at).getTime() >= loadedAt);
  const history = appointments.filter((a) => !upcoming.includes(a)).sort((a, b) => b.starts_at.localeCompare(a.starts_at));

  const mutate = async (body: Record<string, string>): Promise<boolean> => {
    setBusy(true); setError('');
    if (isDemoMode) {
      let result: { success: boolean; error?: string };
      if (body.action === 'book') result = bookDemoAppointment(body.slotId, body.type as 'in_person' | 'online', body.reason);
      else if (body.action === 'status') result = updateDemoAppointment(body.appointmentId, body.status as AppointmentStatus);
      else if (body.action === 'add_slot') result = addDemoAvailability(body.startsAt);
      else result = removeDemoAvailability(body.slotId);
      if (!result.success) setError(result.error || 'Could not update the appointment.');
      await reload();
      setBusy(false);
      return result.success;
    }
    try {
      const response = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update appointment.');
      await reload();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update appointment.');
      await reload();
      return false;
    }
    finally { setBusy(false); }
  };
  const book = async (event: FormEvent) => {
    event.preventDefault();
    if (!slotId) { setError('Choose an available appointment time.'); return; }
    if (await mutate({ action: 'book', slotId, type: appointmentType, reason: reason.trim() })) {
      setSlotId(''); setReason('');
    }
  };
  const addSlot = async (event: FormEvent) => {
    event.preventDefault();
    if (!newSlot) return;
    if (await mutate({ action: 'add_slot', startsAt: new Date(newSlot).toISOString() })) setNewSlot('');
  };

  if (!currentUser || currentUser.role === 'admin') return <p className="text-sm text-slate-600">Appointments are available to patients and doctors.</p>;
  const isPatient = currentUser.role === 'patient';

  const appointmentRow = (item: Appointment) => <article key={item.id} className="flex flex-col gap-3 border-b border-slate-200 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-slate-900">{isPatient ? item.doctor_name : item.patient_name}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800' : item.status === 'pending' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{labels[item.status] ?? item.status}</span>
      </div>
      <p className="mt-1 text-sm text-slate-600">{isPatient ? item.specialization : `@${item.patient_username}`} · {prettyDate(item.starts_at)}</p>
      <p className="mt-1 text-xs capitalize text-slate-500">{item.appointment_type.replace('_', ' ')}{item.reason ? ` · ${item.reason}` : ''}</p>
    </div>
    <div className="flex flex-wrap gap-2">
      {isPatient && ['pending', 'confirmed'].includes(item.status) && <button disabled={busy} onClick={() => void mutate({ action: 'status', appointmentId: item.id, status: 'cancelled' })} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>}
      {!isPatient && item.status === 'pending' && <>
        <button disabled={busy} onClick={() => void mutate({ action: 'status', appointmentId: item.id, status: 'confirmed' })} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white disabled:opacity-50"><Check size={15}/>Accept</button>
        <button disabled={busy} onClick={() => void mutate({ action: 'status', appointmentId: item.id, status: 'rejected' })} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-50"><X size={15}/>Reject</button>
      </>}
      {!isPatient && item.status === 'confirmed' && <>
        <button disabled={busy} onClick={() => void mutate({ action: 'status', appointmentId: item.id, status: 'completed' })} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-slate-900 px-3 text-sm font-medium text-white disabled:opacity-50"><Check size={15}/>Complete</button>
        <button disabled={busy} onClick={() => void mutate({ action: 'status', appointmentId: item.id, status: 'cancelled' })} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-50">Cancel</button>
      </>}
    </div>
  </article>;

  return <section className="mx-auto max-w-5xl space-y-8">
    <header className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800"><CalendarClock size={20}/></span>
      <div><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Appointments</h1><p className="mt-1 text-sm text-slate-600">{isPatient ? 'Book a visit and keep track of your care.' : 'Review requests and manage your schedule.'}</p></div>
    </header>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
    {isPatient ? <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Book an appointment</h2>
      <form onSubmit={book} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">Doctor<select required value={doctorId} onChange={(e) => { setDoctorId(e.target.value); setSlotId(''); }} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base">
          <option value="">Choose a doctor with available times</option>{availableDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.profiles.full_name} · {doctor.specialization}</option>)}
        </select></label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">Available time<select required value={slotId} onChange={(e) => setSlotId(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base" disabled={!doctorId}>
          <option value="">Choose a time</option>{selectedSlots.map((slot) => <option key={slot.id} value={slot.id}>{prettyDate(slot.starts_at)}</option>)}
        </select></label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">Visit type<select value={appointmentType} onChange={(e) => setAppointmentType(e.target.value as 'in_person' | 'online')} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base"><option value="in_person">In person</option><option value="online">Online</option></select></label>
        <label className="grid gap-1.5 text-sm font-medium text-slate-700">Reason <span className="font-normal text-slate-500">(optional)</span><input maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-3 text-base" placeholder="Briefly describe what you need help with" /></label>
        <div className="sm:col-span-2"><button disabled={busy || loading || !slotId} className="min-h-11 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Request appointment'}</button></div>
      </form>
      {selectedDoctor && <aside className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">{selectedDoctor.profiles.full_name} · {selectedDoctor.specialization}</p>
        <p className="mt-1">{selectedDoctor.experience_years} years’ experience · {selectedDoctor.qualifications.join(', ') || 'Qualifications not listed'}{selectedDoctor.profiles.location ? ` · ${selectedDoctor.profiles.location}` : ''}</p>
        {selectedDoctor.bio && <p className="mt-2 text-slate-600">{selectedDoctor.bio}</p>}
      </aside>}
      {doctorId && selectedSlots.length === 0 && <p className="mt-3 text-sm text-slate-500">No open times for this doctor yet.</p>}
      {!loading && doctors.length > 0 && availableDoctors.length === 0 && <p className="mt-3 text-sm text-slate-500">No verified doctors have published appointment times yet.</p>}
      {isDemoMode && availableDoctors.length === 0 && <p className="mt-2 text-sm text-sky-800">Demo walkthrough: switch to the verified doctor view, add a time, then return here to request it.</p>}
    </div> : <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Manage availability</h2><p className="mt-1 text-sm text-slate-600">Each slot is 30 minutes. Times are shown in your local timezone.</p>
      {!doctorVerified && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Appointment availability is available after your account is verified.</p>}
      <form onSubmit={addSlot} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-1.5 text-sm font-medium text-slate-700">Start time<input type="datetime-local" step={1800} value={newSlot} onChange={(e) => setNewSlot(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 px-3 text-base" /></label>
        <button disabled={busy || !newSlot || !doctorVerified} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16}/>Add slot</button>
      </form>
      {slots.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{slots.map((slot) => <span key={slot.id} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"><Clock3 size={14}/>{prettyDate(slot.starts_at)}<button aria-label="Remove slot" disabled={busy} onClick={() => void mutate({ action: 'remove_slot', slotId: slot.id })} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X size={14}/></button></span>)}</div>}
    </div>}
    <section className="rounded-xl border border-slate-200 bg-white px-4 sm:px-6"><div className="border-b border-slate-200 py-4"><h2 className="font-semibold text-slate-900">{isPatient ? 'Upcoming appointments' : 'Requests and upcoming'}</h2></div>
      {loading ? <p className="flex items-center gap-2 py-6 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin"/>Loading appointments…</p> : upcoming.length ? upcoming.map(appointmentRow) : <div className="py-6 text-sm text-slate-500"><p>{isPatient ? 'No upcoming appointments. Choose a doctor and an available time to get started.' : 'No appointment requests or upcoming visits.'}</p>{isDemoMode && !isPatient && <p className="mt-2 text-sky-800">Try the demo flow: publish a time, switch to patient view to request it, then return here to accept or reject.</p>}</div>}
    </section>
    <section className="rounded-xl border border-slate-200 bg-white px-4 sm:px-6"><div className="border-b border-slate-200 py-4"><h2 className="font-semibold text-slate-900">Appointment history</h2></div>
      {!loading && history.length ? history.map(appointmentRow) : <p className="py-6 text-sm text-slate-500">Past and closed appointments will appear here.</p>}
    </section>
  </section>;
}
