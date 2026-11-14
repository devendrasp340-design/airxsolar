import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, CheckCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { apiFetch, normalizeAuPhone } from '../../utils/api';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
  'text/rtf',
];
const ALLOWED_EXT_REGEX = /\.(jpe?g|png|pdf|docx?|rtf)$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function QuoteModal({
  isOpen,
  onClose,
  prefillProduct = '',
  defaultExpandOptional = false,
  highlightFloorPlan = false,
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [suburb, setSuburb] = useState('');
  const [product, setProduct] = useState(prefillProduct);
  const [floorPlan, setFloorPlan] = useState(null);
  const [showOptional, setShowOptional] = useState(defaultExpandOptional || highlightFloorPlan);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setProduct(prefillProduct);
      setShowOptional(defaultExpandOptional || highlightFloorPlan);
    }
  }, [isOpen, prefillProduct, defaultExpandOptional, highlightFloorPlan]);

  if (!isOpen) return null;

  const validatePhone = (ph) => {
    const normalized = normalizeAuPhone(ph);
    return /^04\d{8}$/.test(normalized);
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT_REGEX.test(file.name)) {
      setErrors((prev) => ({ ...prev, file: 'Allowed: JPG, PNG, PDF, DOC, DOCX, RTF' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, file: 'File must be under 10MB' }));
      return;
    }
    setFloorPlan(file);
    setErrors((prev) => ({ ...prev, file: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!validatePhone(phone)) newErrors.phone = 'Enter a valid AU mobile (04XX XXX XXX)';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      let floorPlanUrl = null;
      if (floorPlan) {
        // Attempt public floorplan upload if available, otherwise record filename
        try {
          const uploadData = new FormData();
          uploadData.append('file', floorPlan);
          const upRes = await apiFetch('/api/leads/upload', {
            method: 'POST',
            body: uploadData,
          });
          if (upRes.ok) {
            const upJson = await upRes.json();
            floorPlanUrl = upJson.file?.url || upJson.url || floorPlan.name;
          } else {
            floorPlanUrl = `pending-file:${floorPlan.name}`;
          }
        } catch {
          floorPlanUrl = `pending-file:${floorPlan.name}`;
        }
      }

      const payload = {
        full_name: fullName.trim(),
        phone: normalizeAuPhone(phone),
        suburb: suburb.trim() || undefined,
        product_or_service: product.trim() || undefined,
        source_page: window.location.pathname,
        floor_plan_url: floorPlanUrl || undefined,
      };

      const res = await apiFetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        // Fire Google Ads conversion event
        if (typeof window !== 'undefined') {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'lead_submitted',
            lead_product: product || 'general',
            source_page: window.location.pathname,
          });
          if (window.gtag) {
            window.gtag('event', 'lead_submitted', {
              event_category: 'conversion',
              event_label: product || 'general',
            });
          }
        }
      } else {
        const data = await res.json();
        const errMsg = data.error || data.errors?.[0]?.msg || 'Something went wrong. Please try again.';
        setErrors({ submit: errMsg });
      }
    } catch {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFullName('');
    setPhone('');
    setSuburb('');
    setProduct(prefillProduct);
    setFloorPlan(null);
    setShowOptional(defaultExpandOptional || highlightFloorPlan);
    setSubmitted(false);
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-navy/50 modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="AirXSolar" className="w-9 h-9 object-contain shrink-0" />
            <div>
              <h2 className="font-heading font-bold text-xl text-navy">Get Your Free Quote</h2>
              <p className="text-xs text-navy/50 mt-0.5">Fast callback from our Perth team</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg hover:bg-slate transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-navy/50" />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="p-8 text-center">
            <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <img src="/logo-icon.png" alt="AirXSolar" className="w-14 h-14 object-contain" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white shadow">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <h3 className="font-heading font-bold text-xl text-navy mb-2">Thank You!</h3>
            <p className="text-navy/60 mb-6 text-sm">
              We've received your quote request. Our Perth team will call you shortly.
            </p>
            <button
              onClick={handleClose}
              className="bg-navy text-white font-bold px-6 py-3.5 min-h-[48px] rounded-lg hover:bg-navy/90 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-navy`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="04XX XXX XXX"
                maxLength={12}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-navy`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Optional section toggle */}
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-2 text-sm font-medium text-navy/70 hover:text-navy transition-colors"
            >
              {showOptional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showOptional ? 'Hide optional details' : 'Add suburb, product or floor plan (optional)'}
            </button>

            {showOptional && (
              <div className="space-y-4 animate-fade-in pt-1">
                {/* Suburb */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Suburb</label>
                  <input
                    type="text"
                    value={suburb}
                    onChange={(e) => setSuburb(e.target.value)}
                    placeholder="e.g. Joondalup"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-navy"
                  />
                </div>

                {/* Service/Product */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Service / Product</label>
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g. Daikin Split System"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-navy"
                  />
                </div>

                {/* Floor Plan Upload */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">
                    Floor Plan Upload {highlightFloorPlan && <span className="text-amber font-bold">(Recommended for Ducted)</span>}
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      highlightFloorPlan ? 'border-amber bg-amber/5' : 'border-gray-200 hover:border-amber'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-navy/50 shrink-0" />
                    <span className="text-sm text-navy/70 truncate">
                      {floorPlan ? floorPlan.name : 'JPG, PNG, PDF, DOC, DOCX, RTF (max 10MB)'}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.rtf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {errors.file && (
                    <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                  )}
                </div>
              </div>
            )}

            {/* Consent */}
            <p className="text-xs text-navy/50 leading-relaxed">
              By submitting, you consent to AirXSolar contacting you by phone or SMS regarding your enquiry. Your details are kept private and never shared.
            </p>

            {/* Submit error */}
            {errors.submit && (
              <p className="text-red-500 text-sm text-center">{errors.submit}</p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber text-navy font-bold py-3.5 min-h-[48px] rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Get My Free Quote'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
