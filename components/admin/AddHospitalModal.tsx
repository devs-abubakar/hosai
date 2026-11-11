'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import { X, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHospitalModal: React.FC<AddHospitalModalProps> = ({ isOpen, onClose }) => {
  const { addHospital } = useHosaiStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [helpline, setHelpline] = useState('');
  const [departments, setDepartments] = useState('Cardiology, Emergency, Radiology, ICU');
  const [services, setServices] = useState('24/7 Trauma, MRI, Ambulance, Pharmacy');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !phone.trim()) {
      toast.error('Please fill in required fields: Name, City, and Phone.');
      return;
    }

    addHospital({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim() || 'NY',
      contact_phone: phone.trim(),
      emergency_helpline: helpline.trim() || phone.trim(),
      departments: departments.split(',').map((d) => d.trim()).filter(Boolean),
      services: services.split(',').map((s) => s.trim()).filter(Boolean),
      rating: 4.8,
      is_verified: true,
      image_url: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600',
    });

    toast.success(`Hospital registered: ${name}`, {
      description: 'Added to public hospital directory.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-slate-900/50 p-3 backdrop-blur-xs sm:items-center sm:p-4">
      <div className="modal-enter relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Healthcare Facility</h3>
              <p className="text-xs text-slate-500">Register verified hospital or specialty medical center</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Hospital / Clinic Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mount Sinai Medical Pavilion"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1000 Fifth Avenue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                City &amp; State *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. New York, NY"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Main Reception Phone *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. +1 (212) 555-0100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                24/7 Emergency Helpline
              </label>
              <input
                type="text"
                placeholder="e.g. +1 (212) 555-9111"
                value={helpline}
                onChange={(e) => setHelpline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Departments (comma-separated)
            </label>
            <input
              type="text"
              value={departments}
              onChange={(e) => setDepartments(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Key Services &amp; Facilities (comma-separated)
            </label>
            <input
              type="text"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-press px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-press px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors"
            >
              Add Hospital
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
