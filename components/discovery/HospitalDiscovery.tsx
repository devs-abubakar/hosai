'use client';

import React, { useState } from 'react';
import { useHosaiStore } from '@/lib/store';
import {
  Building2,
  Search,
  Phone,
  PhoneCall,
  MapPin,
  Star,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

export const HospitalDiscovery: React.FC = () => {
  const { state } = useHosaiStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const allDepartments = [
    'all',
    'Cardiology',
    'Emergency Medicine',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Orthopedics',
    'Family Medicine',
  ];

  const filteredHospitals = state.hospitals.filter((h) => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.departments.some((d) => d.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept =
      selectedDept === 'all' ||
      h.departments.some((d) => d.toLowerCase().includes(selectedDept.toLowerCase()));

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Discover Hospitals &amp; Emergency Trauma Centers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified partner healthcare institutions, 24/7 intensive care units, and clinical departments.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hospital name, city, or medical department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {allDepartments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDept === dept
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredHospitals.map((hosp) => (
          <div
            key={hosp.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image banner */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={
                    hosp.image_url ||
                    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600'
                  }
                  alt={hosp.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {hosp.rating}
                </div>
                {hosp.is_verified && (
                  <div className="absolute top-3 left-3 bg-sky-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Facility
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{hosp.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {hosp.address}, {hosp.city}, {hosp.state}
                  </p>
                </div>

                {/* Emergency Contact Banner */}
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-xs flex items-center justify-between text-rose-900">
                  <span className="font-bold flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-rose-600" /> 24/7 Helpline:
                  </span>
                  <a
                    href={`tel:${hosp.emergency_helpline}`}
                    className="font-bold text-rose-700 hover:underline"
                  >
                    {hosp.emergency_helpline}
                  </a>
                </div>

                {/* Departments pills */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Specialized Departments:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {hosp.departments.map((dept, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Key Facilities:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hosp.services.join(' • ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {hosp.contact_phone}
              </span>
              <button
                onClick={() => {
                  toast.success(`Connected to ${hosp.name} reception`, {
                    description: `Call dispatched to ${hosp.contact_phone}`,
                  });
                }}
                className="btn-press px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Contact Desk
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
