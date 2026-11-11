import { NextResponse } from 'next/server';
import { getAuthenticatedProfile } from '@/lib/supabase/server';

export async function GET() {
  const auth = await getAuthenticatedProfile();
  if (!auth) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (auth.profile.role === 'admin') return NextResponse.json({ error: 'Appointments are not available to administrators.' }, { status: 403 });

  const { data: appointments, error } = await auth.supabase.rpc('list_my_appointments');
  if (error) return NextResponse.json({ error: 'Appointment service is not configured. Apply the appointment migration.' }, { status: 503 });
  const now = new Date().toISOString();
  if (auth.profile.role === 'doctor') {
    const { data: doctorProfile } = await auth.supabase.from('doctor_profiles')
      .select('verification_status').eq('id', auth.user.id).maybeSingle();
    const { data: slots } = await auth.supabase.from('doctor_availability')
      .select('id, starts_at, ends_at, status').eq('doctor_id', auth.user.id)
      .eq('status', 'available').gt('starts_at', now).order('starts_at').limit(80);
    return NextResponse.json({ appointments: appointments ?? [], slots: slots ?? [], doctorVerified: doctorProfile?.verification_status === 'verified' });
  }

  const { data: doctors, error: doctorsError } = await auth.supabase.from('doctor_profiles')
    .select('id, specialization, qualifications, experience_years, bio, consultation_fee, profiles!inner(id, full_name, username, location)')
    .eq('verification_status', 'verified').order('experience_years', { ascending: false }).limit(100);
  if (doctorsError) return NextResponse.json({ error: 'Could not load verified doctors.' }, { status: 503 });
  const { data: slots } = await auth.supabase.from('doctor_availability')
    .select('id, doctor_id, starts_at, ends_at').eq('status', 'available').gt('starts_at', now)
    .order('starts_at').limit(200);
  return NextResponse.json({ appointments: appointments ?? [], doctors: doctors ?? [], slots: slots ?? [] });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedProfile();
  if (!auth) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const action = body.action;
  let result;
  if (action === 'book' && auth.profile.role === 'patient'
      && typeof body.slotId === 'string'
      && (body.type === 'in_person' || body.type === 'online')
      && (body.reason === undefined || (typeof body.reason === 'string' && body.reason.length <= 1000))) {
    result = await auth.supabase.rpc('create_appointment', {
      p_slot_id: body.slotId, p_appointment_type: body.type, p_reason: body.reason || null,
    });
  } else if (action === 'status' && typeof body.appointmentId === 'string'
      && ['confirmed', 'rejected', 'cancelled', 'completed'].includes(String(body.status))) {
    result = await auth.supabase.rpc('set_appointment_status', {
      p_appointment_id: body.appointmentId, p_status: body.status,
    });
  } else if (action === 'add_slot' && auth.profile.role === 'doctor' && typeof body.startsAt === 'string') {
    const date = new Date(body.startsAt);
    if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now() + 30 * 60_000 || date.getTime() > Date.now() + 90 * 86400_000 || date.getTime() % 1_800_000 !== 0) {
      return NextResponse.json({ error: 'Select a future 30-minute UTC time within 90 days.' }, { status: 400 });
    }
    result = await auth.supabase.rpc('create_doctor_availability', { p_starts_at: date.toISOString() });
  } else if (action === 'remove_slot' && auth.profile.role === 'doctor' && typeof body.slotId === 'string') {
    result = await auth.supabase.rpc('remove_doctor_availability', { p_slot_id: body.slotId });
  } else {
    return NextResponse.json({ error: 'Invalid action or role.' }, { status: 400 });
  }
  if (result.error) {
    const detail = result.error.message.toLowerCase();
    const message = detail.includes('no longer available') || detail.includes('already booked')
      ? 'That time is no longer available. Refresh the list and choose another.'
      : detail.includes('transition') ? 'This appointment can no longer be changed to that status.'
        : detail.includes('verified') ? 'A verified doctor account is required for that action.'
          : 'Could not complete this appointment change. Check that the appointment migration is installed.';
    return NextResponse.json({ error: message }, { status: 409 });
  }
  return NextResponse.json({ ok: true, id: result.data });
}
