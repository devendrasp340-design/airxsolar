import React, { useState } from 'react';
import {
  Phone,
  Wrench,
  Gauge,
  CalendarCheck,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import QuoteModal from '../components/shared/QuoteModal';
import TrustBar from '../components/shared/TrustBar';
import useSEO from '../hooks/useSEO';

const services = [
  {
    icon: Gauge,
    image: '/images/technician-servicing-outdoor.jpg',
    title: 'AC Regassing & Leak Detection',
    badge: 'Restores Ice-Cold Cooling',
    desc: 'High-pressure nitrogen leak detection, flare nut repair, and compliant R32 / R410A refrigerant recharging to restore peak performance.',
    cta: 'Book Regassing Quote',
  },
  {
    icon: Wrench,
    image: '/images/technician-servicing-wall-ac.jpg',
    title: 'Fast Fault Diagnostics & Electrical',
    badge: 'Same-Day Error Resolution',
    desc: 'Flashing fault lights, tripping circuit breakers, loud fan motors, or no power? Our certified technicians test PCBs and electricals quickly.',
    cta: 'Book Fault Repair',
  },
  {
    icon: CalendarCheck,
    image: '/images/ac-maintenance-indoor.jpg',
    title: 'Seasonal Deep Clean & Sanitisation',
    badge: 'Lowers Power Bills by 25%',
    desc: 'Anti-bacterial hydro coil wash, drain line clearing, mould treatment, and airflow calibration to keep family air fresh and clean.',
    cta: 'Book Seasonal Service',
  },
];

export default function RepairMaintenancePage() {
  useSEO({
    title: 'Air Conditioning Repair & Servicing Perth | AirXSolar',
    description:
      'Same-day AC repairs & servicing across Perth for split & ducted systems — Daikin, Mitsubishi Electric, Fujitsu, Hisense & more. Book a technician.',
    path: '/repair-maintenance',
  });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState('AC Repair / Maintenance');

  const openQuote = (service) => {
    setQuoteProduct(service);
    setQuoteOpen(true);
  };

  return (
    <div>
      {/* Urgent Hero with Licensed Technician Photo */}
      <section className="bg-navy text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/40 text-amber text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Same-Day Breakdown Response Across Perth
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
                Air Conditioning Repair &amp; Servicing in Perth
              </h1>
              <p className="text-white/80 text-base lg:text-lg mb-8 leading-relaxed max-w-xl">
                AC stopped blowing cold air during a Perth heatwave? Our mobile technicians carry genuine parts and diagnostic gear to get your cooling back fast.
              </p>

              {/* Prominent Urgent Click-to-Call */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="tel:+61481705789"
                  className="bg-amber text-navy font-extrabold px-8 py-4 min-h-[48px] rounded-xl hover:bg-amber/90 transition-all shadow-lg inline-flex items-center justify-center gap-2.5 text-base hover:scale-[1.02] w-full sm:w-auto"
                >
                  <Phone className="w-5 h-5" />
                  Urgent Call: 0481 705 789
                </a>
                <button
                  onClick={() => openQuote('Urgent AC Repair')}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 min-h-[48px] rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-base border border-white/20 w-full sm:w-auto"
                >
                  Request Repair Quote <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Response Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-white/80 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                  <span>Licensed Technicians</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                  <span>All Major Brands</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                  <span>Transparent Upfront Rates</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-[#0c2340]">
                <img
                  src="/images/technician-servicing-outdoor.jpg"
                  alt="Perth Air Conditioner Technician Diagnosing Outdoor Compressor Unit"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/30 to-transparent flex flex-col justify-end p-6">
                  <span className="bg-red-500 text-white text-[11px] font-extrabold uppercase px-2.5 py-1 rounded w-fit mb-2 shadow flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Priority Emergency Dispatch
                  </span>
                  <h3 className="text-white font-heading font-bold text-lg leading-snug">
                    Accurate Manifold Gauge Diagnostics
                  </h3>
                  <p className="text-white/75 text-xs mt-1">
                    Precision refrigerant pressure testing, leak pinpointing, and compressor health checks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid with Visual Cards */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy">
              Split &amp; Ducted AC Repair &amp; Servicing
            </h2>
            <p className="text-navy/60 text-sm sm:text-base mt-2">
              We service and repair Daikin, Mitsubishi Electric, MHI, Fujitsu, Hisense, TECO, Panasonic &amp; more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="bg-slate rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={svc.image}
                      alt={svc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-navy/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow">
                      {svc.badge}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="w-10 h-10 bg-amber/15 rounded-xl flex items-center justify-center mb-3">
                      <svc.icon className="w-5 h-5 text-amber" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-navy mb-2">
                      {svc.title}
                    </h3>
                    <p className="text-navy/70 text-sm leading-relaxed mb-6">{svc.desc}</p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => openQuote(svc.title)}
                    className="w-full bg-navy hover:bg-navy-light text-white font-bold py-3 min-h-[44px] rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center"
                  >
                    {svc.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues Checklist with Diagnostic Photo */}
      <section className="py-14 bg-slate">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 border border-gray-100">
            {/* Left Image Column */}
            <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[280px] overflow-hidden">
              <img
                src="/images/ac-maintenance-outdoor.jpg"
                alt="Air Conditioner Outdoor Unit Diagnostic and Maintenance in Perth"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent flex items-end p-6">
                <span className="text-xs font-semibold text-white/95 bg-navy/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  Perth Heatwave Emergency Service
                </span>
              </div>
            </div>

            {/* Right Checklist Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl text-navy mb-3">
                  Signs Your Air Conditioner Needs Repair
                </h2>
                <p className="text-navy/60 text-sm mb-6">
                  Catching minor faults early prevents expensive compressor burnout and keeps your energy bills low.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-navy/85 mb-8">
                  {[
                    'Blowing warm or weak airflow',
                    'Water dripping from indoor unit',
                    'Unusual rattling or grinding noises',
                    'Musty smell when switched on',
                    'Flashing error codes on controller',
                    'Sudden spike in electricity bills',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <a
                  href="tel:+61468428494"
                  className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white font-bold px-6 py-3.5 min-h-[48px] rounded-xl transition-colors shadow-sm text-sm w-full sm:w-auto"
                >
                  <Phone className="w-4 h-4 text-amber" /> Call 0468 428 494
                </a>
                <button
                  onClick={() => openQuote('AC Diagnostic & Repair')}
                  className="inline-flex items-center justify-center gap-2 bg-amber hover:bg-amber/90 text-navy font-bold px-6 py-3.5 min-h-[48px] rounded-xl transition-colors shadow-sm text-sm w-full sm:w-auto"
                >
                  Book Technician Callback
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <QuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        prefillProduct={quoteProduct}
      />
    </div>
  );
}
