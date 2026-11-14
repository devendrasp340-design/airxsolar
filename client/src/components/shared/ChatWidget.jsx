import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { apiFetch, normalizeAuPhone } from '../../utils/api';

const SERVICE_OPTIONS = [
  { id: 'Split System', label: 'Split System' },
  { id: 'Ducted System', label: 'Ducted System' },
  { id: 'Repair/Service', label: 'Repair / Service' },
];

const PROPERTY_OPTIONS = [
  { id: 'Residential', label: 'Residential' },
  { id: 'Commercial', label: 'Commercial' },
];

export default function ChatWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [step, setStep] = useState(1); // 1: service, 2: property type, 3: contact form, 4: thank you
  const [service, setService] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');
  const isDucted = location.pathname.startsWith('/ducted-systems');

  // Display Airy message popup on first scroll or after 8s
  useEffect(() => {
    if (isAdmin || isOpen || tooltipDismissed) return;

    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 8000);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setShowTooltip(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAdmin, isOpen, tooltipDismissed]);

  if (isAdmin) return null;

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  };

  const handleSelectService = (svc) => {
    setService(svc);
    setStep(2);
  };

  const handleSelectProperty = (prop) => {
    setPropertyType(prop);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your name');
      return;
    }
    const normalized = normalizeAuPhone(phone);
    if (!/^04\d{8}$/.test(normalized)) {
      setError('Enter a valid AU mobile (04XX XXX XXX)');
      return;
    }
    if (!smsConsent) {
      setError('Please tick SMS/phone consent to continue');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: normalized,
          product_or_service: `${service} (${propertyType})`,
          source_page: 'chatbot',
        }),
      });

      if (res.ok) {
        setStep(4);
        if (typeof window !== 'undefined') {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'lead_submitted', source_page: 'chatbot' });
        }
      } else {
        const data = await res.json();
        setError(data.error || data.errors?.[0]?.msg || 'Could not submit. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetChat = () => {
    setStep(1);
    setService('');
    setPropertyType('');
    setFullName('');
    setPhone('');
    setSmsConsent(false);
    setError('');
  };

  return (
    <div
      className={`fixed right-4 sm:right-6 z-[9999] flex flex-col items-end pointer-events-none max-w-[calc(100vw-32px)] transition-all duration-300 ${
        isDucted
          ? 'bottom-[calc(76px+env(safe-area-inset-bottom,0px))] lg:bottom-6'
          : 'bottom-4 sm:bottom-6'
      }`}
      style={{
        zIndex: 9999,
      }}
    >
      {/* Tooltip after 12s — clickable to open chat, with dedicated dismiss button */}
      {showTooltip && !isOpen && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(true);
              setShowTooltip(false);
            }
          }}
          className="pointer-events-auto mb-3 mr-1 bg-white border border-navy/10 hover:border-amber/70 shadow-xl hover:shadow-2xl rounded-xl px-4 py-2.5 max-w-[240px] animate-fade-in relative cursor-pointer group transition-all hover:scale-[1.02]"
          aria-label="Open Airy chat assistant"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
              setTooltipDismissed(true);
            }}
            className="absolute -top-2.5 -right-2.5 w-6 h-6 min-w-[24px] min-h-[24px] bg-navy text-white rounded-full flex items-center justify-center text-xs hover:bg-navy/80 shadow-md transition-transform hover:scale-110 z-10"
            aria-label="Dismiss chat prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-xs font-semibold text-navy leading-snug">
            Hi! I'm <span className="text-amber font-bold">Airy</span> 👋 Need an AC quote in Perth?
          </p>
          <span className="text-[11px] font-medium text-amber mt-1 inline-flex items-center gap-1 group-hover:underline">
            Click to chat →
          </span>
        </div>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[calc(100vw-32px)] sm:w-[350px] max-w-[350px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-navy/10 overflow-hidden animate-slide-up flex flex-col">
          {/* Header */}
          <div className="bg-navy text-white px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber/80 shadow-sm">
                  <img src="/airy-avatar.jpg" alt="Airy" className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-0 right-0 flex h-3 w-3 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                </span>
              </div>
              <div>
                <p className="font-heading font-bold text-sm leading-tight">Airy — AirXSolar Assistant</p>
                <p className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online now · Perth Team
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate/50 min-h-[260px] flex flex-col justify-between overflow-y-auto">
            {step === 1 && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-white rounded-xl p-3 shadow-sm text-sm text-navy">
                  G'day! I'm <strong>Airy</strong>. What air conditioning service can I help you with today?
                </div>
                <div className="space-y-2 pt-1">
                  {SERVICE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectService(opt.id)}
                      className="w-full text-left px-4 py-3 min-h-[44px] bg-white hover:bg-amber hover:text-navy font-semibold text-sm text-navy rounded-xl border border-navy/10 transition-colors shadow-sm flex items-center"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3 animate-fade-in">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs text-navy/60 hover:text-navy min-h-[36px] py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="bg-white rounded-xl p-3 shadow-sm text-sm text-navy">
                  Great, <strong>{service}</strong>! Is this for a residential home or a commercial property?
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {PROPERTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectProperty(opt.id)}
                      className="px-3 py-3 min-h-[44px] bg-white hover:bg-amber text-navy font-semibold text-sm rounded-xl border border-navy/10 transition-colors shadow-sm text-center flex items-center justify-center"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-xs text-navy/60 hover:text-navy min-h-[36px] py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="bg-white rounded-xl p-3 shadow-sm text-xs text-navy">
                  Got it: <strong>{service}</strong> · <strong>{propertyType}</strong>. Enter your details and we'll call you back fast!
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name *"
                  className="w-full px-3 py-3 min-h-[44px] rounded-lg border border-gray-200 bg-white text-base sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Mobile (04XX XXX XXX) *"
                  maxLength={12}
                  className="w-full px-3 py-3 min-h-[44px] rounded-lg border border-gray-200 bg-white text-base sm:text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber"
                />
                <label className="flex items-start gap-2 text-xs text-navy/70 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={smsConsent}
                    onChange={(e) => setSmsConsent(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-amber focus:ring-amber min-w-[16px] min-h-[16px]"
                  />
                  <span>I consent to receive a call or SMS from AirXSolar regarding my quote.</span>
                </label>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber text-navy font-bold py-3 min-h-[44px] rounded-lg text-sm hover:bg-amber/90 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Sending...' : 'Request Callback'}
                </button>
              </form>
            )}

            {step === 4 && (
              <div className="text-center py-6 space-y-3 animate-fade-in">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-heading font-bold text-navy">Thanks, {fullName}!</h4>
                <p className="text-xs text-navy/70">
                  Our Perth team has received your {service} enquiry and will call you shortly.
                </p>
                <button
                  onClick={resetChat}
                  className="text-xs font-semibold text-navy underline hover:text-amber"
                >
                  Start another enquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating bubble button wrapper */}
      <div className="relative pointer-events-auto">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowTooltip(false);
          }}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-2 border-amber transition-transform hover:scale-105 shrink-0 overflow-hidden ${
            isOpen ? 'bg-navy p-2' : 'p-0 bg-navy'
          }`}
          style={{
            width: '56px',
            height: '56px',
            minWidth: '56px',
            minHeight: '56px',
          }}
          aria-label="Open Airy chat assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-amber" />
          ) : (
            <img
              src="/airy-avatar.jpg"
              alt="Airy Support Assistant"
              className="w-full h-full object-cover"
            />
          )}
        </button>

        {/* Live online blinking/pulsing green indicator dot */}
        {!isOpen && (
          <span
            className="absolute bottom-0.5 right-0.5 flex h-4 w-4 pointer-events-none z-10 items-center justify-center"
            aria-label="Airy is online"
            title="Online now"
          >
            {/* Outer animated radar ping ring */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            {/* Pulsing & glowing solid green dot with crisp white border */}
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white shadow-md animate-live-dot" />
          </span>
        )}
      </div>
    </div>
  );
}
