'use client';

import React, { useRef, useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  Bot,
  X,
  Send,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  FileText,
  User,
  HeartPulse,
  Pill,
} from 'lucide-react';

interface AiHealthAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiHealthAssistant: React.FC<AiHealthAssistantProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentPatientProfile, state } = useHosaiStore();

  const patientId = currentUser?.id ?? '';
  const allergies = state.allergies.filter((a) => a.patient_id === patientId);
  const conditions = state.medicalConditions.filter((c) => c.patient_id === patientId);
  const medications = state.medications.filter((m) => m.patient_id === patientId);
  const records = state.medicalRecords.filter((r) => r.patient_id === patientId);
  const consultations = state.consultations.filter((c) => c.patient_id === patientId);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${currentUser?.full_name || 'there'}! I am your HOSAI AI Health Assistant. I have secure, authorized access to summarize your medical passport, explain your uploaded laboratory or imaging reports in plain English, and suggest which medical specialists to consult.\n\nPlease note: I am an educational health assistant. I do not provide official diagnoses or prescribe treatments. In an emergency, always call 911 immediately.`,
      timestamp: 'Just now',
    },
  ]);

  const messageId = useRef(0);
  if (!isOpen || !currentUser) return null;

  const generateAiResponse = (query: string): string => {
    const q = query.toLowerCase();

    // 1. Report explanation (Echocardiogram or Lab)
    if (q.includes('echo') || q.includes('heart report') || q.includes('imaging')) {
      const echoRecord = records.find((r) => r.title.toLowerCase().includes('echo'));
      if (echoRecord) {
        return `Based on your **${echoRecord.title}** from ${echoRecord.record_date}:\n\n` +
          `• **Ejection Fraction (EF 62%)**: This is normal. It indicates your left ventricle pumps a healthy percentage of blood with each heartbeat (normal is 50-70%).\n` +
          `• **Trace Mitral Regurgitation**: A tiny backflow of blood through your mitral valve. This is very common, mild, and currently well-compensated.\n` +
          `• **No Left Ventricular Hypertrophy**: Your heart muscle is not abnormally thickened by high blood pressure.\n\n` +
          `**Summary**: Your heart function is robust and responding very well to your current regimen under Dr. Marcus Vance.`;
      }
      return `Your records indicate your cardiac imaging and echocardiograms show stable ventricular function. Always discuss specific clinical questions with your cardiologist.`;
    }

    // 2. Summary of profile / conditions
    if (q.includes('summary') || q.includes('conditions') || q.includes('profile')) {
      const condList = conditions.map((c) => `• **${c.disease_name}** (${c.status})`).join('\n');
      const medList = medications.map((m) => `• **${m.medication_name}** (${m.dosage}, ${m.frequency})`).join('\n');
      const algList = allergies.map((a) => `• **${a.allergen}** (${a.severity} — ${a.reaction})`).join('\n');

      return `Here is your current authorized medical summary:\n\n` +
        `**Diagnosed Conditions:**\n${condList || 'None recorded'}\n\n` +
        `**Active Prescriptions:**\n${medList || 'None active'}\n\n` +
        `**Critical Allergies:**\n${algList || 'No known allergies'}\n\n` +
        `You have ${records.length} encrypted diagnostic documents in your vault.`;
    }

    // 3. Allergies explanation
    if (q.includes('allerg') || q.includes('penicillin')) {
      const pen = allergies.find((a) => a.allergen.toLowerCase().includes('penicillin'));
      if (pen) {
        return `**Penicillin Allergy Clinical Warning:**\n\nYour record indicates a **${pen.severity.toUpperCase()}** allergy to Penicillin with risk of *${pen.reaction}*.\n\n` +
          `• **Precaution:** Avoid all Beta-lactam antibiotics (including Amoxicillin, Ampicillin, and certain cephalosporins unless cleared by an allergist).\n` +
          `• **Safety Note:** This alert is highlighted in high-contrast red to any doctor reviewing your chart in HOSAI.`;
      }
      return `You have ${allergies.length} recorded allergies. Always notify clinical staff before taking new medications.`;
    }

    // 4. Specialist guidance
    if (q.includes('specialist') || q.includes('doctor') || q.includes('palpitations') || q.includes('chest')) {
      return `For symptoms such as palpitations, shortness of breath, or blood pressure concerns:\n\n` +
        `• **Recommended Specialist:** **Cardiologist** (Heart & Vascular specialist).\n` +
        `• **Your Treating Doctor:** You are already authorized with **Dr. Marcus Vance (Cardiologist)** at Metro Health Medical Center.\n` +
        `• **Action:** You can schedule a follow-up via our platform. If you experience severe chest pain radiating to your arm or jaw, seek emergency medical care immediately.`;
    }

    // 5. Prescriptions / medications
    if (q.includes('prescription') || q.includes('medication') || q.includes('lisinopril')) {
      const activeMeds = medications.filter((m) => m.status === 'active');
      return `You currently have **${activeMeds.length} active medications**:\n\n` +
        activeMeds.map((m) => `• **${m.medication_name}** ${m.dosage}: ${m.frequency}. Prescribed by ${m.prescribed_by || 'Doctor'}.`).join('\n') +
        `\n\nRemember to take Lisinopril consistently in the morning with water and monitor your blood pressure twice weekly.`;
    }

    // Default clinical guidance
    return `Thank you for your question! As your HOSAI Health Assistant, I'm analyzing your records (Blood Group ${currentPatientProfile?.blood_group || 'O+'}, ${conditions.length} conditions, ${allergies.length} allergies).\n\n` +
      `I can help explain medical terms, summarize test results, or direct you to qualified doctors in our directory. Feel free to click one of the suggested prompts below or ask a specific question about your health records!`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `usr-${++messageId.current}`,
      sender: 'user',
      text: query.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulate snappy AI generation
    setTimeout(() => {
      const reply = generateAiResponse(query);
      const aiMsg: Message = {
        id: `ai-${++messageId.current}`,
        sender: 'ai',
        text: reply,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/60 p-3 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="modal-enter relative my-auto flex h-[min(650px,calc(100dvh-1.5rem))] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">HOSAI AI Health Assistant</h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Grounded
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Context: <span className="text-white font-medium">{currentUser.full_name}</span> (Medical Passport)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="leading-tight text-[11px]">
            <span className="font-bold">Medical Disclaimer:</span> Educational assistant only. Does not diagnose
            conditions or prescribe medication. Consult your physician for medical decisions.
          </p>
        </div>

        {/* Chat message history */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-tr from-sky-500 to-indigo-600 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" /> Suggested:
          </span>
          {[
            'Explain my Echocardiogram report',
            'Summarize my medical profile',
            'Check my Penicillin allergy notes',
            'Which specialist should I consult?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="btn-press px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-700 text-[11px] font-medium whitespace-nowrap shadow-xs transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your health records, lab reports, or conditions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="btn-press px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
