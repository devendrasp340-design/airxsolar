import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ZoomIn, X } from 'lucide-react';
import Header from '../components/layout/Header';
import { apiFetch, normalizeAuPhone } from '../utils/api';
import useSEO from '../hooks/useSEO';

const ZONES_DATA = [
  { id: 0, name: 'Master bed', x: 20, y: 20, w: 190, h: 130, offset: -1, on: true, flow: 80, vent: [105, 28] },
  { id: 1, name: 'Open living', x: 210, y: 20, w: 190, h: 160, offset: 0, on: true, flow: 100, vent: [305, 28] },
  { id: 2, name: 'Kids’ room', x: 20, y: 150, w: 190, h: 130, offset: 0, on: false, flow: 60, vent: [105, 158] },
  { id: 3, name: 'Home office', x: 210, y: 180, w: 190, h: 100, offset: 1, on: true, flow: 40, vent: [305, 188] },
];

const SCENES_DATA = [
  {
    name: 'Work from home',
    description: 'Only the home office is running during the workday.',
    zones: [
      { on: false, flow: 80 },
      { on: false, flow: 100 },
      { on: false, flow: 60 },
      { on: true, flow: 60 },
    ],
  },
  {
    name: 'Family evening',
    description: 'Living area at full flow, with the kids’ room running alongside.',
    zones: [
      { on: false, flow: 80 },
      { on: true, flow: 100 },
      { on: true, flow: 60 },
      { on: false, flow: 40 },
    ],
  },
  {
    name: 'Bedtime',
    description: 'Bedrooms only, at a gentle flow for a quiet night.',
    zones: [
      { on: true, flow: 40 },
      { on: false, flow: 100 },
      { on: true, flow: 40 },
      { on: false, flow: 40 },
    ],
  },
  {
    name: 'Whole home',
    description: 'Every zone on, for a house full of people.',
    zones: [
      { on: true, flow: 80 },
      { on: true, flow: 80 },
      { on: true, flow: 80 },
      { on: true, flow: 80 },
    ],
  },
];

const TYPING_WORDS = ['Cool', 'Heat'];

const TOTAL_AREA = ZONES_DATA.reduce((acc, z) => acc + z.w * z.h, 0);

export default function DuctedSystemsPage() {
  useSEO({
    title: 'Ducted Air Conditioning Perth | Daikin 10kW | AirXSolar',
    description:
      'Daikin 10.0 kW ducted reverse cycle air conditioning with AirTouch 5 zoning, fully installed in Perth for $9,500 + GST. Licensed installers. Fixed quote.',
    path: '/ducted-systems',
  });
  // Headline Typing Graphics State ("Cool" <-> "Heat")
  const [wordIdx, setWordIdx] = useState(0);
  const [charCount, setCharCount] = useState(TYPING_WORDS[0].length);
  const [typingPhase, setTypingPhase] = useState('pause'); // 'typing' | 'pause' | 'deleting'

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setWordIdx(0);
      setCharCount(TYPING_WORDS[0].length);
      return;
    }

    const currentWord = TYPING_WORDS[wordIdx];
    let timer;

    if (typingPhase === 'pause') {
      timer = setTimeout(() => setTypingPhase('deleting'), 2400);
    } else if (typingPhase === 'deleting') {
      if (charCount > 0) {
        timer = setTimeout(() => setCharCount((c) => c - 1), 55);
      } else {
        setWordIdx((idx) => (idx + 1) % TYPING_WORDS.length);
        setTypingPhase('typing');
      }
    } else if (typingPhase === 'typing') {
      if (charCount < currentWord.length) {
        timer = setTimeout(() => setCharCount((c) => c + 1), 85);
      } else {
        setTypingPhase('pause');
      }
    }

    return () => clearTimeout(timer);
  }, [charCount, typingPhase, wordIdx]);

  const typedWord = TYPING_WORDS[wordIdx].slice(0, charCount);

  // Simulator State
  const [mode, setMode] = useState('cool'); // 'cool' | 'heat'
  const [setpoint, setSetpoint] = useState(22);
  const [sceneIndex, setSceneIndex] = useState(null);
  const [zones, setZones] = useState(ZONES_DATA);
  const [liveTemps, setLiveTemps] = useState(
    ZONES_DATA.map((z) => (z.on ? 22 + z.offset : 31))
  );

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [suburb, setSuburb] = useState('');
  const [file, setFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cutawayZoomOpen, setCutawayZoomOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Airflow drift calculation & smooth temperature step
  useEffect(() => {
    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const interval = setInterval(() => {
      setLiveTemps((prevTemps) =>
        prevTemps.map((cur, i) => {
          const z = zones[i];
          const amb = mode === 'cool' ? 31 : 13;
          const target = z.on ? setpoint + z.offset : amb;
          const diff = target - cur;
          const rate = isReduced ? 9 : z.on ? 0.05 + (z.flow / 100) * 0.25 : 0.04;
          if (Math.abs(diff) <= rate) return target;
          return cur + (diff > 0 ? rate : -rate);
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [zones, setpoint, mode]);

  // Simulator Handlers
  const toggleZone = (idx) => {
    setZones((prev) =>
      prev.map((z, i) => (i === idx ? { ...z, on: !z.on } : z))
    );
    setSceneIndex(null);
  };

  const handleDamperChange = (idx, val) => {
    const flow = Number(val);
    setZones((prev) =>
      prev.map((z, i) => (i === idx ? { ...z, flow } : z))
    );
    setSceneIndex(null);
  };

  const selectScene = (idx) => {
    const sc = SCENES_DATA[idx];
    setZones((prev) =>
      prev.map((z, i) => ({
        ...z,
        on: sc.zones[i].on,
        flow: sc.zones[i].flow,
      }))
    );
    setSceneIndex(idx);
  };

  const stepTemp = (delta) => {
    if (mode === 'cool') {
      setSetpoint((s) => Math.min(26, Math.max(18, s + delta)));
    } else {
      setSetpoint((s) => Math.min(28, Math.max(18, s + delta)));
    }
  };

  const selectMode = (newMode) => {
    setMode(newMode);
    setSetpoint(newMode === 'cool' ? 22 : 24);
  };

  // Live Calculations
  const activeCount = zones.filter((z) => z.on).length;
  const activeLoad = zones.reduce(
    (acc, z) => (z.on ? acc + (z.w * z.h * z.flow) / 100 : acc),
    0
  );
  const loadPercent = Math.round((activeLoad / TOTAL_AREA) * 100);

  const activeSum = zones.reduce(
    (acc, z, i) => (z.on ? acc + liveTemps[i] : acc),
    0
  );
  const avgInside = activeCount ? (activeSum / activeCount).toFixed(1) + '°' : '–';

  const outdoorTemp = mode === 'cool' ? 38 : 9;
  const diffOutdoor = activeCount
    ? Math.abs(outdoorTemp - activeSum / activeCount).toFixed(0) + '°'
    : '–';

  const loadSavingsMessage =
    activeCount === 0
      ? 'All zones are off, so nothing is being conditioned.'
      : activeCount === 4
      ? `All four rooms are being ${mode === 'cool' ? 'cooled' : 'heated'}.`
      : `Only ${activeCount} of 4 rooms are being ${
          mode === 'cool' ? 'cooled' : 'heated'
        }, so the system isn’t working for empty space.`;

  // Form Formatting & Submit
  const formatPhone = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 4) return d;
    if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  };

  const handlePhoneInput = (e) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      if (!/\.(jpe?g|png|pdf|docx?|rtf)$/i.test(f.name)) {
        setFormErrors((prev) => ({ ...prev, file: 'Use a JPG, PNG, PDF, DOC or RTF file.' }));
        e.target.value = '';
        setFile(null);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, file: 'File must be under 10 MB.' }));
        e.target.value = '';
        setFile(null);
        return;
      }
      setFile(f);
      setFormErrors((prev) => ({ ...prev, file: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!name.trim()) errors.name = 'Enter your full name.';
    const digits = phone.replace(/\D/g, '');
    if (!digits) errors.phone = 'Enter your mobile number.';
    else if (!/^04\d{8}$/.test(digits)) errors.phone = 'Enter an Australian mobile, like 0412 345 678.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setIsSubmitting(true);

    try {
      let floorPlanUrl = null;
      if (file) {
        try {
          const fd = new FormData();
          fd.append('floorplan', file);
          const upRes = await fetch('/api/leads/upload', { method: 'POST', body: fd });
          if (upRes.ok) {
            const upData = await upRes.json();
            floorPlanUrl = upData.fileUrl || upData.filePath || null;
          }
        } catch {
          floorPlanUrl = `pending-file:${file.name}`;
        }
      }

      await apiFetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          suburb: suburb.trim() || undefined,
          service: 'Daikin 10 kW Ducted + AirTouch 5 ($9,500 + GST Fully Installed)',
          notes: `Daikin landing page lead. Suburb: ${suburb || 'N/A'}. Floor plan: ${
            floorPlanUrl || 'None'
          }`,
          source: 'ducted_systems_landing',
        }),
      });

      setIsSubmitted(true);
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'generate_lead',
          product: 'Daikin 10 kW + AirTouch 5',
        });
      }
    } catch {
      setFormErrors({ submit: 'Something went wrong. Please call 0468 428 494 directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="ducted-page-root">
        {/* Scoped CSS matching Daikin 10 kW Ducted + AirTouch 5 Perth Mockup */}
        <style>{`
        .ducted-page-root {
          --ink:#0B2545; --paper:#F4F7F9; --card:#FFFFFF; --sun:#F2A516; --sun-ink:#0B2545;
          --muted:#4A5E78; --line:#D5DEE7; --air:#7FB6D9; --heat:#E8613A; --deep:#0B2545; --on-deep:#F4F7F9;
          --f-head:'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --f-body:'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--paper);
          color: var(--ink);
          font: 400 1rem/1.6 var(--f-body);
          -webkit-text-size-adjust: 100%;
          overflow-x: clip;
        }

        .ducted-page-root *, .ducted-page-root *::before, .ducted-page-root *::after {
          box-sizing: border-box;
        }

        .ducted-page-root h1, .ducted-page-root h2, .ducted-page-root h3 {
          font-family: var(--f-head);
          line-height: 1.08;
          margin: 0;
          letter-spacing: -.02em;
        }

        .ducted-page-root a:not([class*="text-"]) { color: inherit; }
        .ducted-page-root :focus-visible { outline: 3px solid var(--sun); outline-offset: 2px; }

        .ducted-page-root .wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .ducted-page-root .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 0;
          cursor: pointer;
          font: 600 .95rem var(--f-body);
          padding: 13px 22px;
          border-radius: 10px;
          text-decoration: none;
          background: var(--sun);
          color: var(--sun-ink);
          transition: transform .15s;
        }
        .ducted-page-root .btn:active { transform: scale(.97); }
        .ducted-page-root .btn.ghost {
          background: transparent;
          color: inherit;
          border: 1.5px solid currentColor;
        }

        .ducted-page-root header.top {
          position: sticky;
          top: 0;
          z-index: 20;
          background: color-mix(in srgb, var(--paper) 92%, transparent);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--line);
        }
        .ducted-page-root header.top .wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 60px;
        }
        @media(min-width:980px){
          .ducted-page-root header.top .wrap { height: 64px; }
        }

        .ducted-page-root .logo {
          font: 800 1.3rem var(--f-head);
          text-decoration: none;
          letter-spacing: -.03em;
        }
        .ducted-page-root .logo b { color: var(--sun); }
        .ducted-page-root .logo small {
          display: none;
          font: 500 .7rem var(--f-body);
          color: var(--muted);
          letter-spacing: 0;
          margin-top: -2px;
        }
        @media(min-width:560px){
          .ducted-page-root .logo small { display: block; }
        }

        .ducted-page-root .hdr-r { display: flex; gap: 14px; align-items: center; }
        .ducted-page-root .hdr-r a.tel {
          display: none;
          font-weight: 600;
          text-decoration: none;
          font-size: .9rem;
        }
        @media(min-width:560px){
          .ducted-page-root .hdr-r a.tel { display: inline; }
        }

        /* Hero */
        .ducted-page-root .hero { padding: 28px 0 48px; }
        @media(min-width:760px){ .ducted-page-root .hero { padding: 44px 0 64px; } }

        .ducted-page-root .hero-grid {
          display: grid;
          gap: 0;
          grid-template-columns: 1fr;
        }
        .ducted-page-root .hero-grid > * { min-width: 0; }
        .ducted-page-root .hero-l { display: contents; }
        .ducted-page-root .hero-grid .formcard { order: 5; margin: 8px 0 36px; }
        .ducted-page-root .hero-grid .sim { order: 6; }

        @media(min-width:980px){
          .ducted-page-root .hero-grid {
            grid-template-columns: 1.25fr .75fr;
            gap: 40px;
            align-items: start;
          }
          .ducted-page-root .hero-l { display: block; }
          .ducted-page-root .hero-grid .formcard { order: 0; margin: 0; }
          .ducted-page-root .hero-grid .sim { order: 0; }
        }
        @media(min-width:1280px){
          .ducted-page-root .wrap { padding: 0 32px; }
          .ducted-page-root .hero h1 { font-size: 4.1rem; }
        }

        .ducted-page-root .hero h1 {
          font-size: clamp(2.2rem, 5.2vw, 3.9rem);
          font-weight: 800;
          max-width: 15ch;
        }
        .ducted-page-root .type-word {
          display: inline-block;
          min-width: 2.35ch;
          position: relative;
        }
        @keyframes typeCaretBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .ducted-page-root .type-caret {
          display: inline-block;
          width: 3.5px;
          height: 0.85em;
          border-radius: 2px;
          vertical-align: middle;
          margin-left: 2px;
          animation: typeCaretBlink 0.9s steps(1, end) infinite;
        }
        .ducted-page-root .lede {
          color: var(--muted);
          max-width: 52ch;
          font-size: 1.08rem;
          margin: 18px 0 26px;
        }
        .ducted-page-root .price {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .ducted-page-root .price strong {
          font: 800 clamp(3rem, 7vw, 4.6rem)/1 var(--f-head);
          letter-spacing: -.04em;
        }
        .ducted-page-root .price span { font: 600 1.1rem var(--f-head); }
        .ducted-page-root .fine {
          font-size: .85rem;
          color: var(--muted);
          max-width: 56ch;
          margin: 0 0 32px;
        }

        /* Simulator - Compact & Professionally Aligned */
        .ducted-page-root .sim {
          position: relative;
          background: radial-gradient(90% 70% at 0% 0%, rgba(56,189,248,.18), transparent 60%),
                      radial-gradient(80% 60% at 100% 100%, rgba(242,165,22,.14), transparent 60%),
                      linear-gradient(160deg, #0F2C54 0%, #0B2545 45%, #061428 100%);
          color: #EAF0F6;
          border-radius: 18px;
          padding: 16px 18px;
          display: grid;
          gap: 12px;
          border: 1px solid #1E3A63;
          box-shadow: 0 16px 36px -16px rgba(0,0,0,.65);
          overflow: hidden;
        }
        .ducted-page-root .sim-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding-bottom: 2px;
        }
        .ducted-page-root .sim-head h3 { font-size: 1.08rem; font-weight: 700; margin: 0; }
        .ducted-page-root .sim-head p { margin: 2px 0 0; font-size: .78rem; color: #A9BCD3; max-width: 46ch; line-height: 1.35; }
        .ducted-page-root .live {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
          background: #0E2A4F;
          border: 1px solid #2A4A75;
          color: #BFE0F5;
        }
        .ducted-page-root .live i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ADE80;
          box-shadow: 0 0 0 0 rgba(74,222,128,.6);
          animation: ping 2s infinite;
        }
        @keyframes ping {
          0% { box-shadow: 0 0 0 0 rgba(74,222,128,.6); }
          70%, 100% { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
        }

        .ducted-page-root .sim-body {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
          align-items: stretch;
        }
        @media(min-width:640px) {
          .ducted-page-root .sim-body {
            grid-template-columns: 1.05fr 0.95fr;
            align-items: stretch;
            gap: 12px;
          }
        }

        .ducted-page-root .leftcol {
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
          justify-content: space-between;
        }
        .ducted-page-root .planbox {
          border-radius: 12px;
          padding: 8px 10px;
          background-color: #07162B;
          border: 1px solid #1E3A63;
          background-image: linear-gradient(rgba(127,182,217,.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(127,182,217,.08) 1px, transparent 1px);
          background-size: 20px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ducted-page-root .plan { width: 100%; height: auto; display: block; max-height: 200px; }
        .ducted-page-root .room { cursor: pointer; transition: opacity .4s; }
        .ducted-page-root .room:focus-visible { outline: none; stroke: #F2A516; stroke-width: 2.5; }
        .ducted-page-root .wall { fill: none; stroke: #8FB1D1; stroke-width: 2.5; stroke-linecap: round; pointer-events: none; }
        .ducted-page-root .furn { fill: rgba(255,255,255,.07); stroke: rgba(255,255,255,.3); stroke-width: 1.1; pointer-events: none; }
        .ducted-page-root .lbl { font: 600 11.5px var(--f-body); fill: #CFE3F5; pointer-events: none; }
        .ducted-page-root .tmp { font: 800 17px var(--f-head); pointer-events: none; font-variant-numeric: tabular-nums; }
        .ducted-page-root .vent { fill: #EAF0F6; pointer-events: none; }
        .ducted-page-root .air {
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-dasharray: 3 8;
          opacity: 0;
          pointer-events: none;
          animation: drift var(--d, 1.4s) linear infinite;
        }
        .ducted-page-root .airg.on .air { opacity: .8; }
        @keyframes drift { to { stroke-dashoffset: -24px; } }

        .ducted-page-root .scen {
          background: rgba(14,36,66,.7);
          border: 1px solid #1E3A63;
          border-radius: 12px;
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 6px;
          flex: 1;
        }
        .ducted-page-root .scen-h { font: 700 .74rem var(--f-head); color: #BFE0F5; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 2px; }
        .ducted-page-root .chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .ducted-page-root .chip {
          border: 1px solid #2F5688;
          background: #0E2A4F;
          color: #CFE3F5;
          border-radius: 999px;
          padding: 6px 12px;
          font: 600 .74rem var(--f-body);
          cursor: pointer;
          min-height: 36px;
          display: inline-flex;
          align-items: center;
          transition: background .15s, border-color .15s, color .15s;
        }
        .ducted-page-root .chip:hover { border-color: #7FB6D9; }
        .ducted-page-root .chip[aria-pressed="true"] { background: #F2A516; border-color: #F2A516; color: #0B2545; font-weight: 700; }
        .ducted-page-root .scen-d { margin: 1px 0 3px; font-size: .72rem; color: #8FA6C0; line-height: 1.3; min-height: 1.6em; }
        .ducted-page-root .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
        .ducted-page-root .stats div { background: #0A1D38; border: 1px solid #1E3A63; border-radius: 8px; padding: 5px 7px; }
        .ducted-page-root .stats span { display: block; font-size: .62rem; color: #7B8FA8; text-transform: uppercase; letter-spacing: .02em; line-height: 1.2; }
        .ducted-page-root .stats b { font: 800 1.12rem var(--f-head); color: #EAF0F6; font-variant-numeric: tabular-nums; display: block; margin-top: 2px; }
        .ducted-page-root .legend { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; font-size: .68rem; color: #8FA6C0; }
        .ducted-page-root .lg { width: 9px; height: 9px; border-radius: 2px; display: inline-block; margin-right: 4px; vertical-align: -1px; }
        .ducted-page-root .lg.c { background: linear-gradient(135deg, #1A5F9A, #4FB3E6); }
        .ducted-page-root .lg.h { background: linear-gradient(135deg, #B8501A, #F2A516); }
        .ducted-page-root .lg.o { background: #3A2A38; }

        /* Pad - Sleek Wall Touch Controller */
        .ducted-page-root .pad {
          background: linear-gradient(180deg, #0A1A30, #060F1F);
          border: 1px solid #2A4A75;
          border-top: 2px solid #F2A516;
          border-radius: 12px;
          padding: 10px 12px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 16px 32px -16px rgba(0,0,0,.7);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 7px;
          height: 100%;
        }
        .ducted-page-root .pad-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: .72rem;
          color: #9FB2C8;
          padding-bottom: 2px;
          border-bottom: 1px solid rgba(42,74,117,.35);
        }
        .ducted-page-root .pad-top b { font: 800 .9rem var(--f-head); }
        .ducted-page-root .setrow { display: flex; align-items: center; justify-content: space-between; padding: 0 4px; }
        .ducted-page-root .step {
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          border-radius: 50%;
          border: 1px solid #2F5688;
          background: #0E2A4F;
          color: #EAF0F6;
          font: 600 1.1rem var(--f-body);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background .15s, transform .1s;
        }
        .ducted-page-root .step:hover { background: #163E72; }
        .ducted-page-root .step:active { transform: scale(.92); }
        .ducted-page-root .big { text-align: center; font: 800 2.1rem/1 var(--f-head); }
        .ducted-page-root .big span {
          background: linear-gradient(180deg, #fff, #9FD4F2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ducted-page-root .big sup {
          font-size: .9rem;
          font-weight: 700;
          vertical-align: baseline;
          position: relative;
          top: -0.4em;
          margin-left: 2px;
          color: #CFE3F5;
        }
        .ducted-page-root .big small { display: block; font: 600 .64rem var(--f-body); color: #7FB6D9; margin-top: 1px; letter-spacing: .04em; text-transform: uppercase; }
        .ducted-page-root .seg { display: grid; grid-template-columns: 1fr 1fr; background: #0E2A4F; border-radius: 6px; padding: 2px; gap: 2px; }
        .ducted-page-root .seg button {
          border: 0;
          background: transparent;
          color: #9FB2C8;
          font: 600 .72rem var(--f-body);
          padding: 4px;
          border-radius: 5px;
          cursor: pointer;
          transition: all .15s;
        }
        .ducted-page-root .seg button[aria-pressed="true"] { background: #EAF0F6; color: #0B2545; font-weight: 700; }
        .ducted-page-root .zr-list { display: flex; flex-direction: column; gap: 5px; }
        .ducted-page-root .zr { background: #0E2240; border: 1px solid #1E3A63; border-radius: 8px; padding: 4px 8px; transition: border-color .15s; }
        .ducted-page-root .zr:hover { border-color: #2F5688; }
        .ducted-page-root .zr-top { display: flex; align-items: center; gap: 7px; }
        .ducted-page-root .zr .n { font-weight: 600; font-size: .76rem; color: #EAF0F6; }
        .ducted-page-root .zr .t { margin-left: auto; font: 700 .72rem var(--f-head); color: #7FB6D9; font-variant-numeric: tabular-nums; }
        .ducted-page-root .sw {
          width: 30px;
          height: 17px;
          border-radius: 999px;
          border: 0;
          background: #2A3F5E;
          position: relative;
          cursor: pointer;
          flex: none;
          transition: background .2s;
        }
        .ducted-page-root .sw::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #fff;
          transition: transform .2s;
        }
        .ducted-page-root .sw[aria-checked="true"] { background: #F2A516; }
        .ducted-page-root .sw[aria-checked="true"]::after { transform: translateX(13px); }
        .ducted-page-root .zr input[type=range] {
          width: 100%;
          height: 12px;
          margin: 1px 0 0;
          accent-color: #F2A516;
          cursor: pointer;
          display: block;
        }
        .ducted-page-root .zr.off { opacity: .55; }
        .ducted-page-root .zr.off .t { color: #7B8FA8; }
        .ducted-page-root .load {
          background: rgba(14,36,66,.5);
          border: 1px solid #1E3A63;
          border-radius: 8px;
          padding: 6px 8px;
        }
        .ducted-page-root .load-top { display: flex; justify-content: space-between; font-size: .7rem; color: #9FB2C8; margin-bottom: 3px; }
        .ducted-page-root .load-top b { color: #F2A516; font-weight: 700; }
        .ducted-page-root .meter { height: 4px; border-radius: 99px; background: #16294A; overflow: hidden; }
        .ducted-page-root .meter i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #7FB6D9, #F2A516); transition: width .4s; }
        .ducted-page-root .load p { margin: 3px 0 0; font-size: .66rem; color: #8FA6C0; line-height: 1.25; }

        /* Formcard */
        .ducted-page-root .formcard {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 18px 40px -22px rgba(11,37,69,.35);
        }
        @media(min-width:760px){ .ducted-page-root .formcard { padding: 26px; } }
        @media(min-width:980px){ .ducted-page-root .formcard { position: sticky; top: 84px; } }

        .ducted-page-root .formcard h2 { font-size: 1.5rem; }
        .ducted-page-root .formcard p.n { color: var(--muted); font-size: .9rem; margin: 6px 0 18px; }
        .ducted-page-root .fld { margin-bottom: 14px; }
        .ducted-page-root .fld label { display: block; font-weight: 600; font-size: .88rem; margin-bottom: 5px; }
        .ducted-page-root .fld input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1.5px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          font: inherit;
        }
        .ducted-page-root .fld input[aria-invalid="true"] { border-color: var(--heat); }
        .ducted-page-root .err { color: var(--heat); font-size: .82rem; margin: 4px 0 0; min-height: 0; }
        .ducted-page-root .hint { font-weight: 400; color: var(--muted); }
        .ducted-page-root details.fp {
          margin: 4px 0 16px;
          border: 1.5px dashed var(--line);
          border-radius: 10px;
          padding: 10px 14px;
        }
        .ducted-page-root details.fp summary { cursor: pointer; font-weight: 600; font-size: .9rem; }
        .ducted-page-root details.fp input { margin-top: 10px; font-size: .85rem; width: 100%; }
        .ducted-page-root .formcard .btn { width: 100%; height: 50px; }
        .ducted-page-root .after { font-size: .8rem; color: var(--muted); margin: 12px 0 0; text-align: center; }
        .ducted-page-root .ok { text-align: center; padding: 10px 0; }
        .ducted-page-root .ok h3 { font-size: 1.4rem; margin: 10px 0; }
        .ducted-page-root .tick {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--sun);
          color: var(--sun-ink);
          display: grid;
          place-items: center;
          margin: 0 auto;
          font-size: 1.6rem;
          font-weight: 800;
        }

        /* Sections */
        .ducted-page-root section.s { padding: 52px 0; border-top: 1px solid var(--line); }
        @media(min-width:760px){ .ducted-page-root section.s { padding: 72px 0; } }
        .ducted-page-root section.s.tight { padding: 32px 0; }
        @media(min-width:760px){ .ducted-page-root section.s.tight { padding: 48px 0; } }

        .ducted-page-root section.deep { background: var(--deep); color: var(--on-deep); border-top: 0; }
        .ducted-page-root .sh { max-width: 640px; margin-bottom: 26px; }
        @media(min-width:760px){ .ducted-page-root .sh { margin-bottom: 36px; } }
        .ducted-page-root .sh h2 { font-size: clamp(1.8rem, 3.6vw, 2.6rem); }
        .ducted-page-root .sh p { color: var(--muted); margin: 12px 0 0; }
        .ducted-page-root .deep .sh p { color: #A9BCD3; }

        .ducted-page-root .bandfig {
          position: relative;
          margin: 0;
          border-radius: 22px;
          overflow: hidden;
          aspect-ratio: 4/3;
          background: #dfe6ec;
        }
        @media(min-width:760px){ .ducted-page-root .bandfig { aspect-ratio: 21/9; } }
        .ducted-page-root .bandfig img { width: 100%; height: 100%; object-fit: cover; object-position: 72% center; display: block; }
        .ducted-page-root .bandfig figcaption {
          position: static;
          background: var(--deep);
          padding: 18px 18px 20px;
          color: #fff;
        }
        @media(min-width:760px){
          .ducted-page-root .bandfig figcaption {
            position: absolute;
            left: 0; right: 0; bottom: 0;
            padding: 48px 28px 24px;
            background: linear-gradient(transparent, rgba(5,14,29,.88));
          }
        }
        .ducted-page-root .bandfig h2 { font-size: clamp(1.3rem, 3vw, 2.1rem); max-width: 24ch; }
        .ducted-page-root .bandfig p { margin: 8px 0 0; color: #D5E1EE; max-width: 52ch; font-size: .95rem; }

        .ducted-page-root .offer { display: grid; gap: 36px; grid-template-columns: 1fr; }
        @media(min-width:980px){
          .ducted-page-root .offer { grid-template-columns: 340px 1fr; gap: 56px; align-items: start; }
          .ducted-page-root .offer .incl { grid-template-columns: 1fr; }
        }
        .ducted-page-root .flyer {
          margin: 0 auto;
          max-width: 340px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid var(--line);
          background: #fff;
          box-shadow: 0 20px 40px -24px rgba(11,37,69,.45);
        }
        .ducted-page-root .flyer img { display: block; width: 100%; height: auto; }
        .ducted-page-root .flyer figcaption { background: var(--card); color: var(--muted); font-size: .8rem; padding: 10px 14px; border-top: 1px solid var(--line); }

        .ducted-page-root .incl { display: grid; gap: 0; grid-template-columns: 1fr; }
        @media(min-width:760px){ .ducted-page-root .incl { grid-template-columns: 1fr 1fr; column-gap: 56px; } }
        .ducted-page-root .incl div { padding: 20px 0; border-bottom: 1px solid var(--line); }
        .ducted-page-root .incl h3 { font-size: 1.15rem; margin-bottom: 4px; }
        .ducted-page-root .incl p { margin: 0; color: var(--muted); font-size: .95rem; }

        .ducted-page-root .cut {
          position: relative;
          margin: 0 0 36px;
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 24px 50px -28px rgba(0,0,0,.6);
          border: 1px solid rgba(255,255,255,.08);
        }
        .ducted-page-root .cutscroll {
          overflow: hidden;
          width: 100%;
          background: #fff;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ducted-page-root .cut .cutscroll img {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          height: auto;
          display: block;
          object-fit: contain;
          margin: 0 auto;
        }
        .ducted-page-root .cut-zoom-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(11,37,69,.88);
          backdrop-filter: blur(6px);
          color: #fff;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: .75rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255,255,255,.2);
          pointer-events: none;
          transition: background .2s, transform .2s;
          box-shadow: 0 4px 12px rgba(0,0,0,.3);
        }
        .ducted-page-root .cutscroll:hover .cut-zoom-badge {
          background: rgba(11,37,69,.98);
          transform: scale(1.03);
        }
        .ducted-page-root .swipe { display: none; }
        .ducted-page-root .cut figcaption {
          background: var(--deep);
          color: #A9BCD3;
          font-size: .88rem;
          line-height: 1.5;
          padding: 14px 18px;
          border-top: 1px solid #22385A;
        }

        .ducted-page-root .path { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; counter-reset: p; }
        .ducted-page-root .path li { position: relative; padding: 0 0 30px 64px; counter-increment: p; }
        .ducted-page-root .path li::before {
          content: counter(p);
          position: absolute;
          left: 0; top: 0;
          width: 42px; height: 42px;
          border-radius: 50%;
          background: var(--sun);
          color: var(--sun-ink);
          display: grid;
          place-items: center;
          font: 800 1.1rem var(--f-head);
        }
        .ducted-page-root .path li::after {
          content: "";
          position: absolute;
          left: 20px; top: 46px; bottom: 4px;
          width: 2px;
          background: linear-gradient(var(--sun), #3A5578);
        }
        .ducted-page-root .path li:last-child::after { display: none; }
        .ducted-page-root .path h3 { font-size: 1.15rem; margin-bottom: 3px; }
        .ducted-page-root .path p { margin: 0; color: #A9BCD3; font-size: .95rem; max-width: 60ch; }
        @media(min-width:900px){
          .ducted-page-root .path { grid-template-columns: repeat(5, 1fr); gap: 18px; }
          .ducted-page-root .path li { padding: 58px 0 0; }
          .ducted-page-root .path li::after {
            left: 46px; right: -18px; top: 20px; bottom: auto;
            width: auto; height: 2px;
            background: linear-gradient(90deg, var(--sun), #3A5578);
          }
        }

        .ducted-page-root .pillars { display: grid; gap: 28px; grid-template-columns: 1fr; }
        @media(min-width:760px){ .ducted-page-root .pillars { grid-template-columns: 1fr 1fr; } }
        .ducted-page-root .pillars div { border-left: 4px solid var(--sun); padding-left: 18px; }
        .ducted-page-root .pillars h3 { font-size: 1.2rem; margin-bottom: 6px; }
        .ducted-page-root .pillars p { margin: 0; color: var(--muted); font-size: .95rem; }

        .ducted-page-root .pair { display: grid; gap: 18px; margin-top: 48px; }
        @media(min-width:760px){ .ducted-page-root .pair { grid-template-columns: 1fr 1fr; } }
        .ducted-page-root .pair figure { margin: 0; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); background: var(--card); }
        .ducted-page-root .pair img { display: block; width: 100%; aspect-ratio: 4/3; object-fit: cover; }
        .ducted-page-root .pair figcaption { padding: 12px 16px; font-size: .88rem; color: var(--muted); }

        .ducted-page-root .quotes { display: grid; gap: 36px; grid-template-columns: 1fr; }
        @media(min-width:900px){ .ducted-page-root .quotes { grid-template-columns: repeat(3, 1fr); } }
        .ducted-page-root blockquote { margin: 0; }
        .ducted-page-root blockquote p { font: 500 1.12rem/1.5 var(--f-head); margin: 0 0 14px; }
        .ducted-page-root blockquote footer { font-size: .85rem; color: var(--muted); }

        .ducted-page-root table.spec { width: 100%; border-collapse: collapse; font-size: .95rem; }
        .ducted-page-root .scroll { overflow-x: auto; }
        .ducted-page-root .spec, .ducted-page-root .spec tbody { display: block; }
        .ducted-page-root .spec tr { display: grid; gap: 2px; padding: 14px 0; border-bottom: 1px solid var(--line); }
        .ducted-page-root .spec th, .ducted-page-root .spec td { border: 0; padding: 0; width: auto; text-align: left; vertical-align: top; }
        .ducted-page-root .spec th { font-family: var(--f-head); font-size: 1rem; font-weight: 600; }
        .ducted-page-root .spec td:last-child { color: var(--muted); }
        @media(min-width:760px){
          .ducted-page-root .spec, .ducted-page-root .spec tbody { display: table-row-group; }
          .ducted-page-root .spec { display: table; }
          .ducted-page-root .spec tr { display: table-row; padding: 0; }
          .ducted-page-root .spec th, .ducted-page-root .spec td { padding: 14px 12px; border-bottom: 1px solid var(--line); }
          .ducted-page-root .spec th { width: 32%; font-family: var(--f-body); font-size: .95rem; }
        }

        .ducted-page-root .final { text-align: left; }
        .ducted-page-root .final .wrap { display: flex; flex-direction: column; gap: 24px; }
        @media(min-width:860px){
          .ducted-page-root .final .wrap { flex-direction: row; align-items: center; justify-content: space-between; }
        }
        .ducted-page-root .final h2 { font-size: clamp(1.8rem, 3.6vw, 2.6rem); max-width: 20ch; }
        .ducted-page-root .final .acts { display: flex; gap: 12px; flex-wrap: wrap; }
        .ducted-page-root .final .acts .btn { flex: 1 1 100%; }
        @media(min-width:560px){ .ducted-page-root .final .acts .btn { flex: 0 0 auto; } }

        .ducted-page-root footer.f { padding: 28px 0; font-size: .82rem; color: var(--muted); border-top: 1px solid var(--line); }
        .ducted-page-root footer.f .wrap { display: flex; flex-direction: column; gap: 12px; justify-content: space-between; }
        @media(min-width:760px){ .ducted-page-root footer.f .wrap { flex-direction: row; } }

        .ducted-page-root .bar {
          position: sticky;
          bottom: 0;
          z-index: 40;
          background: var(--card);
          border-top: 1px solid var(--line);
          padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          box-shadow: 0 -4px 20px rgba(11,37,69,.08);
          width: 100%;
        }
        .ducted-page-root .bar b { font: 800 1.2rem var(--f-head); }
        @media(min-width:980px){ .ducted-page-root .bar { display: none; } }
      `}</style>

      <main id="top">
        {/* 3. Hero Section with Value Anchor & Interactive AirTouch 5 Simulator */}
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-l">
              <h1>
                <span className="sr-only">Ducted Air Conditioning Perth: cool and heat only the rooms you’re in.</span>
                <span aria-hidden="true">
                  <span
                    className="type-word"
                    style={{
                      color: wordIdx === 0 ? '#0072CE' : '#E8613A',
                      transition: 'color 0.25s ease',
                    }}
                  >
                    <span>{typedWord}</span>
                    <span
                      className="type-caret"
                      style={{
                        backgroundColor: wordIdx === 0 ? '#0072CE' : '#E8613A',
                      }}
                    />
                  </span>{' '}
                  only the rooms you’re in.
                </span>
              </h1>
              <p className="lede">
                Daikin 10.0 kW inverter ducted heating and cooling with AirTouch 5 zone control, installed by ARC-licensed Perth tradespeople and built for 44°C summers.
              </p>
              <div className="price">
                <strong>$9,500</strong>
                <span>+ GST, fully installed</span>
              </div>
              <p className="fine">
                Includes 6–8 ceiling outlets, ductwork, the AirTouch 5 touchpad and full commissioning. Conditions apply.
              </p>

              {/* Interactive 4-Zone AirTouch 5 Simulator */}
              <div className="sim" aria-label="AirTouch 5 zone control demo">
                <div className="sim-head">
                  <div>
                    <h3>Try the AirTouch 5 controller</h3>
                    <p>Tap a room or use the touchpad. Switch zones, change the temperature or flip between cooling and heating.</p>
                  </div>
                  <span className="live">
                    <i />Interactive demo
                  </span>
                </div>

                <div className="sim-body">
                  <div className="leftcol">
                    {/* SVG Floor Plan */}
                    <div className="planbox">
                      <svg className="plan" viewBox="0 0 420 300" role="group" aria-label="Floor plan with four zones">
                        <defs>
                          <linearGradient id="gC" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#1A5F9A" />
                            <stop offset="1" stopColor="#4FB3E6" />
                          </linearGradient>
                          <linearGradient id="gH" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#B8501A" />
                            <stop offset="1" stopColor="#F2A516" />
                          </linearGradient>
                          <linearGradient id="gO" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#2B2433" />
                            <stop offset="1" stopColor="#3B2C36" />
                          </linearGradient>
                        </defs>

                        {/* Interactive Clickable Rooms */}
                        {zones.map((z, idx) => {
                          const fill = z.on ? (mode === 'cool' ? 'url(#gC)' : 'url(#gH)') : 'url(#gO)';
                          const opacity = z.on ? (0.55 + (z.flow / 100) * 0.45).toFixed(2) : '1';
                          const textColor = z.on ? (mode === 'cool' ? '#FFFFFF' : '#FFF4DC') : '#B9A7B3';
                          const airStroke = mode === 'cool' ? '#CDEBFF' : '#FFD9A0';
                          const animDuration = (1.9 - (z.flow / 100) * 1.3).toFixed(2) + 's';

                          return (
                            <g key={z.id}>
                              <rect
                                id={`r${idx}`}
                                className="room"
                                x={z.x}
                                y={z.y}
                                width={z.w}
                                height={z.h}
                                fill={fill}
                                opacity={opacity}
                                tabIndex={0}
                                role="button"
                                aria-label={`${z.name} zone`}
                                onClick={() => toggleZone(idx)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleZone(idx);
                                  }
                                }}
                              />
                              {/* Room Name Label */}
                              <text className="lbl" x={z.x + 16} y={z.y + 30}>
                                {z.name}
                              </text>
                              {/* Temperature Live Display */}
                              <text className="tmp" x={z.x + 16} y={z.y + 58} fill={textColor}>
                                {z.on ? liveTemps[idx].toFixed(1) + '°' : 'Off'}
                              </text>
                              {/* Vent Bar */}
                              <rect
                                className="vent"
                                x={z.vent[0] - 9}
                                y={z.vent[1]}
                                width={18}
                                height={5}
                                rx={2}
                                opacity={z.on ? 1 : 0.3}
                              />
                              {/* Animated Air Streams */}
                              <g className={`airg ${z.on ? 'on' : ''}`} style={{ '--d': animDuration }}>
                                {[-6, 0, 6].map((dx, pIdx) => (
                                  <path
                                    key={pIdx}
                                    className="air"
                                    d={`M${z.vent[0] + dx} ${z.vent[1] + 10}v34`}
                                    stroke={airStroke}
                                  />
                                ))}
                              </g>
                            </g>
                          );
                        })}

                        {/* Architectural Furniture Outlines */}
                        <g>
                          <rect className="furn" x="136" y="50" width="58" height="86" rx="6" />
                          <rect className="furn" x="141" y="56" width="20" height="12" rx="3" />
                          <rect className="furn" x="167" y="56" width="20" height="12" rx="3" />
                          <rect className="furn" x="140" y="190" width="52" height="72" rx="6" />
                          <rect className="furn" x="36" y="250" width="56" height="20" rx="3" />
                          <rect className="furn" x="230" y="140" width="110" height="28" rx="8" />
                          <rect className="furn" x="262" y="100" width="56" height="24" rx="5" />
                          <rect className="furn" x="378" y="60" width="12" height="60" rx="3" />
                          <rect className="furn" x="310" y="238" width="70" height="26" rx="4" />
                          <circle className="furn" cx="345" cy="222" r="9" />
                        </g>

                        {/* Architectural Walls */}
                        <path
                          className="wall"
                          d="M20 20H400V280H20Z M210 20V80 M210 110V220 M210 250V280 M20 150H90 M120 150H210 M210 180H300 M330 180H400"
                        />
                      </svg>
                    </div>

                    {/* Scene Selector & Live Stats */}
                    <div className="scen">
                      <div className="scen-h">Pick a scene</div>
                      <div className="chips" role="group" aria-label="Scenes">
                        {SCENES_DATA.map((sc, i) => (
                          <button
                            key={sc.name}
                            type="button"
                            className="chip"
                            aria-pressed={sceneIndex === i}
                            onClick={() => selectScene(i)}
                          >
                            {sc.name}
                          </button>
                        ))}
                      </div>
                      <p className="scen-d">
                        {sceneIndex !== null
                          ? SCENES_DATA[sceneIndex].description
                          : 'Choose a scene, or build your own with the room switches.'}
                      </p>
                      <div className="stats">
                        <div>
                          <span>Rooms active</span>
                          <b>{activeCount} of 4</b>
                        </div>
                        <div>
                          <span>Indoor avg</span>
                          <b>{avgInside}</b>
                        </div>
                        <div>
                          <span>Vs outdoors</span>
                          <b>{diffOutdoor}</b>
                        </div>
                      </div>
                      <div className="legend">
                        <span>
                          <i className="lg c" />Cooling
                        </span>
                        <span>
                          <i className="lg h" />Heating
                        </span>
                        <span>
                          <i className="lg o" />Off
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AirTouch 5 Wall Pad Simulation */}
                  <div className="pad">
                    <div className="pad-top">
                      <span>AirTouch 5</span>
                      <span>
                        Outside in Perth{' '}
                        <b style={{ color: mode === 'cool' ? '#E8613A' : '#7FB6D9' }}>
                          {outdoorTemp}°C
                        </b>
                      </span>
                    </div>

                    <div className="setrow">
                      <button
                        type="button"
                        className="step"
                        aria-label="Lower temperature"
                        onClick={() => stepTemp(-1)}
                      >
                        −
                      </button>
                      <div className="big">
                        <span>{setpoint}</span>
                        <sup>°C</sup>
                        <small>{mode === 'cool' ? 'Cooling' : 'Heating'}</small>
                      </div>
                      <button
                        type="button"
                        className="step"
                        aria-label="Raise temperature"
                        onClick={() => stepTemp(1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="seg" role="group" aria-label="Mode">
                      <button
                        type="button"
                        aria-pressed={mode === 'cool'}
                        onClick={() => selectMode('cool')}
                      >
                        Cool
                      </button>
                      <button
                        type="button"
                        aria-pressed={mode === 'heat'}
                        onClick={() => selectMode('heat')}
                      >
                        Heat
                      </button>
                    </div>

                    {/* Zone Rows with Switches and Sliders */}
                    <div className="zr-list">
                      {zones.map((z, idx) => (
                        <div key={z.id} className={`zr ${z.on ? '' : 'off'}`}>
                          <div className="zr-top">
                            <button
                              type="button"
                              className="sw"
                              role="switch"
                              aria-checked={z.on}
                              aria-label={`${z.name} zone`}
                              onClick={() => toggleZone(idx)}
                            />
                            <span className="n">{z.name}</span>
                            <span className="t">
                              {z.on ? `${liveTemps[idx].toFixed(1)}° · ${z.flow}%` : 'Off'}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            step="5"
                            value={z.flow}
                            disabled={!z.on}
                            aria-label={`${z.name} airflow`}
                            onChange={(e) => handleDamperChange(idx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* System Operating Load Bar */}
                    <div className="load">
                      <div className="load-top">
                        <span>Demo system load</span>
                        <b>{loadPercent}%</b>
                      </div>
                      <div className="meter">
                        <i style={{ width: `${loadPercent}%` }} />
                      </div>
                      <p>{loadSavingsMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Sticky Quote Form Card */}
            <aside className="formcard" id="quote">
              <div id="fwrap">
                {isSubmitted ? (
                  <div className="ok" role="status">
                    <div className="tick">✓</div>
                    <h3>Quote request sent</h3>
                    <p>
                      Thanks, <strong>{name}</strong>. We’ll call <strong>{phone}</strong> to confirm your property details.
                    </p>
                    <a className="btn" href="tel:+61468428494" style={{ marginTop: '16px' }}>
                      Urgent? Call 0468 428 494
                    </a>
                  </div>
                ) : (
                  <>
                    <h2>Get your fixed quote</h2>
                    <p className="n">
                      A Perth specialist will call you back promptly.
                    </p>
                    <form id="qf" noValidate onSubmit={handleSubmit}>
                      <div className="fld">
                        <label htmlFor="nm">Full name</label>
                        <input
                          id="nm"
                          autoComplete="name"
                          placeholder="Liam Henderson"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          aria-invalid={formErrors.name ? 'true' : 'false'}
                        />
                        {formErrors.name && <p className="err">{formErrors.name}</p>}
                      </div>

                      <div className="fld">
                        <label htmlFor="ph">
                          Mobile <span className="hint">(04XX XXX XXX)</span>
                        </label>
                        <input
                          id="ph"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="0412 345 678"
                          value={phone}
                          onChange={handlePhoneInput}
                          aria-invalid={formErrors.phone ? 'true' : 'false'}
                        />
                        {formErrors.phone && <p className="err">{formErrors.phone}</p>}
                      </div>

                      <div className="fld">
                        <label htmlFor="sb">
                          Suburb <span className="hint">(optional)</span>
                        </label>
                        <input
                          id="sb"
                          autoComplete="address-level2"
                          placeholder="Joondalup"
                          value={suburb}
                          onChange={(e) => setSuburb(e.target.value)}
                        />
                      </div>

                      <details className="fp">
                        <summary>Attach a floor plan (optional)</summary>
                        <input
                          id="fl"
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.rtf"
                          onChange={handleFileInput}
                        />
                        {formErrors.file && <p className="err">{formErrors.file}</p>}
                        <span className="hint" style={{ fontSize: '.8rem', display: 'block', marginTop: '6px' }}>
                          PDF, JPG, PNG, DOC or RTF, up to 10 MB.
                        </span>
                      </details>

                      {formErrors.submit && <p className="err" style={{ marginBottom: '10px' }}>{formErrors.submit}</p>}

                      <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending…' : 'Request my quote'}
                      </button>
                      <p className="after">
                        No obligation. Free on-site heat load inspection. Conditions apply.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* 5. Lifestyle Feature Banner */}
        <section className="s tight">
          <div className="wrap">
            <figure className="bandfig">
              <img
                src="/woman-using-smart-thermostat.png"
                alt="A smiling woman adjusting the temperature on a wall-mounted touchpad in a bright open-plan living room."
              />
              <figcaption>
                <h2>Control every room from the wall, your phone or your voice</h2>
                <p>AirTouch 5 works with the iOS and Android app, Alexa and Google. No subscription.</p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 6. What the $9,500 + GST Covers */}
        <section className="s">
          <div className="wrap">
            <div className="sh">
              <h2>What the $9,500 + GST ducted installation covers</h2>
              <p>One price for the system, the install and the controls.</p>
            </div>
            <div className="offer">
              <figure className="flyer">
                <img
                  src="/ducted-banner.jpeg"
                  alt="AirXSolar promotion flyer: Daikin 10.0 kW system with AirTouch 5, $9,500 plus GST fully installed, call 0468 428 494."
                />
                <figcaption>The current AirXSolar promotion flyer.</figcaption>
              </figure>
              <div className="incl">
                <div>
                  <h3>Heating and cooling</h3>
                  <p>10.0 kW cooling and 11.2 kW heating, suited to 3–4 bedroom Perth homes.</p>
                </div>
                <div>
                  <h3>Zone control</h3>
                  <p>Up to 8 zones, so the home office can stay cool while the bedrooms rest.</p>
                </div>
                <div>
                  <h3>Lower running costs</h3>
                  <p>Inverter compressor and an Eco mode that pairs well with rooftop solar.</p>
                </div>
                <div>
                  <h3>App, wall and voice control</h3>
                  <p>iOS and Android app, Alexa and Google. No subscription.</p>
                </div>
                <div>
                  <h3>Free heat load sizing</h3>
                  <p>We check roof cavity, west-facing glass, insulation and room volume before we quote.</p>
                </div>
                <div>
                  <h3>10-year warranty</h3>
                  <p>10 years on parts and compressor. Conditions apply.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Follow the Air Through Your Home (Cutaway & 5-Step Path) */}
        <section className="s deep">
          <div className="wrap">
            <div className="sh">
              <h2>Follow the air through your home</h2>
              <p>Every part of the install, in the order the air travels.</p>
            </div>
            <figure className="cut">
              <div
                className="cutscroll cursor-pointer group"
                onClick={() => setCutawayZoomOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCutawayZoomOpen(true);
                  }
                }}
                aria-label="Enlarge ducted air flow diagram"
              >
                <img
                  src="/isometric-ducted-zoning.png"
                  alt="Cutaway of a Perth home showing the Daikin 10.0 kW unit in the roof space, insulated ducts feeding ceiling outlets, the AirTouch 5 wall controller, and three zones: master bedroom, living area and bedrooms on standby."
                />
                <div className="cut-zoom-badge">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Tap to enlarge</span>
                </div>
              </div>
              <figcaption>
                <span className="swipe">Swipe the picture sideways to read the labels. </span>
                Your whole home in one view: a concealed roof-space unit, ducted outlets in each zone, and the AirTouch 5 controller on the wall.
              </figcaption>
            </figure>
            <ol className="path">
              <li>
                <h3>Outdoor inverter</h3>
                <p>Blue fin anti-corrosion coil for salty coastal air.</p>
              </li>
              <li>
                <h3>Ceiling fan coil</h3>
                <p>Quiet DC fan on spring mounts to stop vibration.</p>
              </li>
              <li>
                <h3>Insulated ducting</h3>
                <p>R1.5 fire-rated acoustic duct keeps roof-space heat out.</p>
              </li>
              <li>
                <h3>Smart dampers</h3>
                <p>Motorised, adjustable in 5% steps through AirTouch 5.</p>
              </li>
              <li>
                <h3>Linear outlets</h3>
                <p>Flush ceiling diffusers that sweep the room without drafts.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* 8. Why Perth Homeowners Choose Us (4 Pillars & 2 Proof Images) */}
        <section className="s">
          <div className="wrap">
            <div className="sh">
              <h2>Why Perth homeowners choose us for ducted air conditioning</h2>
            </div>
            <div className="pillars">
              <div>
                <h3>Pay when it works</h3>
                <p>Lock in a fixed quote with nothing upfront. You pay once the install passes pressure tests and AirTouch 5 is running.</p>
              </div>
              <div>
                <h3>Dual-licensed trades</h3>
                <p>ARC refrigeration (AU# 54219) and WA electrical (EC #14022) in the same crew, with a dedicated switchboard breaker included.</p>
              </div>
              <div>
                <h3>Free delivery to 45 km</h3>
                <p>Joondalup, Wanneroo, Fremantle, Armadale, Rockingham and Mandurah. Further out, such as Yanchep, Ellenbrook, Byford and Dawesville, we can arrange a site assessment.</p>
              </div>
              <div>
                <h3>Sized, not guessed</h3>
                <p>The on-site assessment is free, so the 10 kW unit is only recommended if your home needs it.</p>
              </div>
            </div>
            <div className="pair">
              <figure>
                <img
                  src="/attic-hvac-installation-technician.png"
                  alt="A technician in hi-vis testing a ducted indoor unit in a roof space with insulated ducting."
                />
                <figcaption>Roof-space install and testing, with insulated ducting and the unit commissioned before handover.</figcaption>
              </figure>
              <figure>
                <img
                  src="/modern-daikin-ac-brick-wall.png"
                  alt="A Daikin outdoor unit on a concrete slab beside a brick wall, with an isolator switch and lagged pipework."
                />
                <figcaption>Outdoor unit on a concrete slab, with an isolator switch and neatly lagged pipework.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* 9. What Perth Customers Say */}
        <section className="s">
          <div className="wrap">
            <div className="sh">
              <h2>What Perth customers say</h2>
              <p>Rated 5.0 out of 5 on Google from 12 reviews across Greater Perth.</p>
            </div>
            <div className="quotes">
              <blockquote>
                <p>“Arrived at 7am, protected the carpets, and had all seven outlets and AirTouch 5 running by 3:30pm. The 5% damper control is a game changer.”</p>
                <footer>Marcus C., Canning Vale</footer>
              </blockquote>
              <blockquote>
                <p>“Our old evaporative system is gone. In January heatwaves the bedrooms used to be unlivable, and now I cool the living area from my phone before I drive home.”</p>
                <footer>Sarah and Luke B., Fremantle</footer>
              </blockquote>
              <blockquote>
                <p>“Fixed quote honoured to the cent, and they ran a full heat load calc first. Whisper quiet even on maximum cooling.”</p>
                <footer>Dave R., Joondalup</footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* 10. Package Specifications Table */}
        <section className="s">
          <div className="wrap">
            <div className="sh">
              <h2>Daikin ducted package specifications</h2>
            </div>
            <div className="scroll">
              <table className="spec">
                <tbody>
                  <tr>
                    <th>Outdoor unit</th>
                    <td>Daikin premium inverter, R32 refrigerant</td>
                    <td>Cooling operation up to 46°C ambient</td>
                  </tr>
                  <tr>
                    <th>Rated capacity</th>
                    <td>10.0 kW cooling, 11.2 kW heating</td>
                    <td>Suits 3–4 bedroom homes</td>
                  </tr>
                  <tr>
                    <th>Controller</th>
                    <td>AirTouch 5 touchpad</td>
                    <td>Included in the package price</td>
                  </tr>
                  <tr>
                    <th>Zones</th>
                    <td>Up to 8 damper zones</td>
                    <td>Planned around your floor layout</td>
                  </tr>
                  <tr>
                    <th>Ceiling outlets</th>
                    <td>6 to 8 architectural diffusers</td>
                    <td>Washable filter included</td>
                  </tr>
                  <tr>
                    <th>Compliance</th>
                    <td>ARC and WA electrical licensed</td>
                    <td>Dedicated switchboard breaker</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 11. Final CTA Banner */}
        <section className="s final deep">
          <div className="wrap">
            <h2>Get the $9,500 + GST price before this week’s installs fill</h2>
            <div className="acts">
              <a className="btn" href="#quote">
                Get my quote
              </a>
              <a className="btn ghost" href="tel:+61468428494">
                Call 0468 428 494
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 12. Footer */}
      <footer className="f">
        <div className="wrap" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              to="/"
              aria-label="AirXSolar Home"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#ffffff',
                padding: '6px 12px',
                borderRadius: '10px',
                border: '1px solid #D5DEE7',
                boxShadow: '0 1px 3px rgba(11,37,69,0.06)',
              }}
            >
              <img
                src="/logo-horizontal.jpg"
                alt="AirXSolar"
                style={{ height: '28px', width: 'auto', display: 'block' }}
              />
            </Link>
            <span>© 2026 AirXSolar Perth. Licensed &amp; insured. Conditions apply to promotional pricing and warranty.</span>
          </div>
          <span style={{ fontWeight: 600 }}>
            <a href="tel:+61468428494" style={{ color: '#0B2545' }}>0468 428 494</a> &nbsp;|&nbsp; <a href="tel:+61481705789" style={{ color: '#0B2545' }}>0481 705 789</a>
          </span>
        </div>
      </footer>

      {/* 13. Sticky Mobile Bottom Ribbon */}
      <div className="bar">
        <div style={{ minWidth: 0, paddingRight: '4px' }}>
          <small style={{ color: 'var(--muted)', fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'block' }}>
            Daikin 10 kW + AirTouch 5
          </small>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '1px' }}>
            <b style={{ fontSize: '1.25rem', lineHeight: 1.1 }}>$9,500</b>
            <small style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>+ GST*</small>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <a
            className="btn ghost"
            aria-label="Call AirXSolar"
            href="tel:+61468428494"
            style={{
              padding: '10px 14px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Call
          </a>
          <a
            className="btn"
            href="#quote"
            style={{
              padding: '10px 16px',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            Get quote
          </a>
        </div>
      </div>
      </div>

      {/* Lightbox Zoom Modal for Whole-Home Cutaway Diagram */}
      {cutawayZoomOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/90 p-4 modal-backdrop"
          onClick={() => setCutawayZoomOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden p-3 sm:p-5 shadow-2xl animate-fade-in flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-navy text-base sm:text-lg">
                  Follow the Air Through Your Home
                </h3>
                <p className="text-xs text-navy/60">
                  Daikin 10 kW roof unit, duct distribution &amp; AirTouch 5 zoning
                </p>
              </div>
              <button
                onClick={() => setCutawayZoomOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg hover:bg-slate text-navy/70 transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto max-h-[78vh] flex items-center justify-center bg-slate/30 rounded-xl p-2">
              <img
                src="/isometric-ducted-zoning.png"
                alt="Cutaway of a Perth home showing the Daikin 10.0 kW unit in the roof space, insulated ducts feeding ceiling outlets, the AirTouch 5 wall controller, and three zones: master bedroom, living area and bedrooms on standby."
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
