import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  Award,
  Wrench,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import QuoteModal from '../components/shared/QuoteModal';
import TrustBar from '../components/shared/TrustBar';
import useSEO from '../hooks/useSEO';

const suburbs = [
  'Joondalup', 'Fremantle', 'Rockingham', 'Armadale',
  'Midland', 'Mandurah', 'Canning Vale', 'Cannington',
  'Perth CBD', 'Balcatta', 'Morley', 'Wanneroo',
];

export default function InstallationPage() {
  useSEO({
    title: 'Split & Ducted Aircon Installation Perth | AirXSolar',
    description:
      'Licensed ARCtick air conditioning installers across Perth. Split systems installed in 2–4 hours, ducted with clean roof ducting. Free quote today.',
    path: '/installation',
  });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState('AC Installation');

  const openQuote = (service) => {
    setQuoteProduct(service);
    setQuoteOpen(true);
  };

  return (
    <div>
      {/* Hero with Professional Installation Photography */}
      <section className="bg-navy text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-amber/20 border border-amber/30 text-amber text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
                <ShieldCheck className="w-4 h-4" /> ARCtick &amp; WA Electrical Licensed Installers
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-4 leading-tight">
                Fast, Clean &amp; Certified Air Conditioning Installation Across Perth
              </h1>
              <p className="text-white/80 text-base lg:text-lg mb-8 leading-relaxed max-w-xl">
                Split systems installed in 2–4 hours. Whole-home ducted solutions completed with precision roof ducting, drop sheets, and zero mess left behind.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => openQuote('AC Installation Quote')}
                  className="bg-amber text-navy font-bold px-8 py-4 min-h-[48px] rounded-xl hover:bg-amber/90 transition-all shadow-md inline-flex items-center justify-center gap-2 text-base hover:scale-[1.02] w-full sm:w-auto"
                >
                  Get a Free Installation Quote <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="tel:+61481705789"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 min-h-[48px] rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-base border border-white/15 w-full sm:w-auto"
                >
                  <Phone className="w-5 h-5 text-amber" /> Call 0481 705 789
                </a>
              </div>

              {/* Quick Trust Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-white/80 border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                  <span>Licensed Electricians</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                  <span>Drop Sheets Used</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                  <span>Full Site Clean-up</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-[#0c2340]">
                <img
                  src="/images/split-system-install.jpg"
                  alt="Certified AirXSolar Technician Installing Split System in Perth Home"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/30 to-transparent flex flex-col justify-end p-6">
                  <span className="bg-amber text-navy text-[11px] font-extrabold uppercase px-2.5 py-1 rounded w-fit mb-2 shadow">
                    Clean Workmanship
                  </span>
                  <h3 className="text-white font-heading font-bold text-lg leading-snug">
                    Precision Split System Wall Mounting
                  </h3>
                  <p className="text-white/75 text-xs mt-1">
                    Laser-leveled, neat capping, dedicated electrical isolation, and full vacuum commissioning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Split vs Ducted Installation Showcase */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy">
              Choose Your Split or Ducted AC Installation
            </h2>
            <p className="text-navy/60 text-sm sm:text-base mt-2">
              Every system is installed by fully licensed ARC-certified refrigeration mechanics and electricians.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Split System Installation */}
            <div className="bg-slate rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
              <div>
                <div className="relative h-60 sm:h-64 overflow-hidden">
                  <img
                    src="/images/split-system-install.jpg"
                    alt="Split System Air Conditioner Installation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-navy/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
                    <Clock className="w-3.5 h-3.5 text-amber" /> 2–4 Hour Rapid Install
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="font-heading font-extrabold text-2xl text-navy mb-2">
                    Split System Installation
                  </h3>
                  <p className="text-navy/70 text-sm mb-6 leading-relaxed">
                    Ideal for single rooms, master bedrooms, living spaces, and granny flats. Back-to-back or custom conduit routing available.
                  </p>

                  <ul className="space-y-3 text-sm text-navy/85 mb-6">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span>Weatherproof outdoor brackets &amp; heavy-duty anti-vibration slab pads</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span>UV-resistant color-matched trunking to match your home’s exterior</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span>Dedicated electrical circuit &amp; electrical safety certificate included</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <button
                  onClick={() => openQuote('Split System Installation')}
                  className="w-full bg-navy hover:bg-navy-light text-white font-bold py-3.5 min-h-[48px] rounded-xl transition-colors shadow-sm"
                >
                  Quote Split Installation
                </button>
              </div>
            </div>

            {/* Ducted System Installation */}
            <div className="bg-slate rounded-3xl overflow-hidden border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group">
              <div>
                <div className="relative h-60 sm:h-64 overflow-hidden">
                  <img
                    src="/images/ducted-attic-install.jpg"
                    alt="Whole Home Ducted Air Conditioning Attic Installation in Perth"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-navy/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow">
                    <Wrench className="w-3.5 h-3.5 text-amber" /> 1–2 Days Turnkey Install
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <h3 className="font-heading font-extrabold text-2xl text-navy mb-2">
                    Ducted System Installation
                  </h3>
                  <p className="text-navy/70 text-sm mb-6 leading-relaxed">
                    Whole-home cooling and heating with invisible ceiling diffusers, high-efficiency roof ducting, and smart multi-room zoning.
                  </p>

                  <ul className="space-y-3 text-sm text-navy/85 mb-6">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span>Free home site inspection &amp; engineered heat-load layout</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span>R1.5 insulated flexible ductwork &amp; low-noise streamlined diffusers</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <span>AirTouch 5 smart touchscreen &amp; mobile app integration</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <button
                  onClick={() => openQuote('Ducted System Installation')}
                  className="w-full bg-amber hover:bg-amber/90 text-navy font-bold py-3.5 min-h-[48px] rounded-xl transition-colors shadow-sm"
                >
                  Quote Ducted Installation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Workmanship Standards Gallery (3 Cards) */}
      <section className="py-14 lg:py-20 bg-slate">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-amber/20 text-amber-dark text-xs font-bold px-3.5 py-1.5 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber" /> Built for Perth Conditions
            </div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-navy">
              Quality Aircon Installation Workmanship in Every Detail
            </h2>
            <p className="text-navy/60 text-sm sm:text-base mt-2">
              We never cut corners. From outdoor anti-vibration footings to roof cavity duct sealing, our work complies with AS/NZS 3000 standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="/images/outdoor-unit-brickwall.jpg"
                  alt="Neat Outdoor AC Compressor Unit on Brick Wall"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-bold text-lg text-navy mb-2">
                    Weatherproof Wall &amp; Slab Mounting
                  </h4>
                  <p className="text-navy/70 text-sm leading-relaxed">
                    Heavy-duty rubber vibration dampeners, secure masonry anchoring, and UV-stabilized capping to endure Perth’s scorching 40°C+ summer heat.
                  </p>
                </div>
              </div>
            </div>

            {/* Standard 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="/images/perth-sideyard-install.jpg"
                  alt="Sunny Perth Side Yard Air Conditioner Installation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-bold text-lg text-navy mb-2">
                    Compliant Side-Yard Placement
                  </h4>
                  <p className="text-navy/70 text-sm leading-relaxed">
                    Positioned for optimal heat dissipation and strictly compliant with local council boundary noise regulations for peace and quiet.
                  </p>
                </div>
              </div>
            </div>

            {/* Standard 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img
                  src="/images/smart-thermostat-touch.jpg"
                  alt="Homeowner Using Smart Home AC Controller"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-bold text-lg text-navy mb-2">
                    Smart AirTouch 5 Calibration
                  </h4>
                  <p className="text-navy/70 text-sm leading-relaxed">
                    Every zoning system is paired with your home Wi-Fi, programmed with customized schedules, and demonstrated in-person before handover.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Licensed Installer Badges & Service Areas */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-navy mb-3">
              AC Installation Across All Perth Metro Suburbs
            </h2>
            <p className="text-navy/70 text-sm lg:text-base mb-5">
              Our mobile installation teams operate north, south, east, and west of the Swan River — with free delivery within 45km of Perth CBD.
            </p>
            <div className="flex flex-wrap gap-2">
              {suburbs.map((suburb) => (
                <span
                  key={suburb}
                  className="inline-flex items-center gap-1.5 bg-slate text-navy text-xs font-semibold px-3 py-2 rounded-lg shadow-sm"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber" /> {suburb}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber/15 rounded-xl flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-amber" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy">ARCtick Refrigerant Handling Licence</h3>
                <p className="text-sm text-navy/60">Licence L207042. Compliant with Australian environmental &amp; safety standards.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber/15 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-navy">$20M Public Liability Insurance</h3>
                <p className="text-sm text-navy/60">Full peace of mind for residential and commercial sites.</p>
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
