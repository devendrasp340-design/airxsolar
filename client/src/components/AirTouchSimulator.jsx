import React, { useState, useEffect } from 'react';

export const ZONES_DATA = [
  { id: 0, name: 'Master bed', x: 20, y: 20, w: 190, h: 130, offset: -1, on: true, flow: 80, vent: [105, 28] },
  { id: 1, name: 'Open living', x: 210, y: 20, w: 190, h: 160, offset: 0, on: true, flow: 100, vent: [305, 28] },
  { id: 2, name: 'Kids’ room', x: 20, y: 150, w: 190, h: 130, offset: 0, on: false, flow: 60, vent: [105, 158] },
  { id: 3, name: 'Home office', x: 210, y: 180, w: 190, h: 100, offset: 1, on: true, flow: 40, vent: [305, 188] },
];

export const SCENES_DATA = [
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

const TOTAL_AREA = ZONES_DATA.reduce((acc, z) => acc + z.w * z.h, 0);

export default function AirTouchSimulator() {
  const [mode, setMode] = useState('cool'); // 'cool' | 'heat'
  const [setpoint, setSetpoint] = useState(22);
  const [sceneIndex, setSceneIndex] = useState(null);
  const [zones, setZones] = useState(ZONES_DATA);
  const [liveTemps, setLiveTemps] = useState(
    ZONES_DATA.map((z) => (z.on ? 22 + z.offset : 31))
  );

  // Dynamic airflow drift simulation & gradual temperature settling
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

  // Handlers
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

  // Calculations
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

  return (
    <div className="airtouch-simulator-root">
      <style>{`
        .airtouch-simulator-root {
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          width: 100%;
        }
        .airtouch-simulator-root *,
        .airtouch-simulator-root *::before,
        .airtouch-simulator-root *::after {
          box-sizing: border-box;
        }

        /* Simulator - Compact & Professionally Aligned */
        .airtouch-simulator-root .sim {
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
        .airtouch-simulator-root .sim-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding-bottom: 2px;
        }
        .airtouch-simulator-root .sim-head h3 {
          font-size: 1.08rem;
          margin: 0;
          font-weight: 700;
        }
        .airtouch-simulator-root .sim-head p {
          margin: 2px 0 0;
          font-size: .78rem;
          color: #A9BCD3;
          max-width: 46ch;
          line-height: 1.35;
        }
        .airtouch-simulator-root .live {
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
        .airtouch-simulator-root .live i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4ADE80;
          box-shadow: 0 0 0 0 rgba(74,222,128,.6);
          animation: at5-ping 2s infinite;
        }
        @keyframes at5-ping {
          0% { box-shadow: 0 0 0 0 rgba(74,222,128,.6); }
          70%, 100% { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
        }

        .airtouch-simulator-root .sim-body {
          display: grid;
          gap: 12px;
          grid-template-columns: 1fr;
          align-items: stretch;
        }
        @media(min-width:640px) {
          .airtouch-simulator-root .sim-body {
            grid-template-columns: 1.05fr 0.95fr;
            align-items: stretch;
            gap: 12px;
          }
        }

        .airtouch-simulator-root .leftcol {
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 100%;
          justify-content: space-between;
        }
        .airtouch-simulator-root .planbox {
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
        .airtouch-simulator-root .plan {
          width: 100%;
          height: auto;
          display: block;
          max-height: 200px;
        }
        .airtouch-simulator-root .room {
          cursor: pointer;
          transition: opacity .4s;
        }
        .airtouch-simulator-root .room:focus-visible {
          outline: none;
          stroke: #F2A516;
          stroke-width: 2.5;
        }
        .airtouch-simulator-root .wall {
          fill: none;
          stroke: #8FB1D1;
          stroke-width: 2.5;
          stroke-linecap: round;
          pointer-events: none;
        }
        .airtouch-simulator-root .furn {
          fill: rgba(255,255,255,.07);
          stroke: rgba(255,255,255,.3);
          stroke-width: 1.1;
          pointer-events: none;
        }
        .airtouch-simulator-root .lbl {
          font-family: inherit;
          font-size: 11.5px;
          font-weight: 600;
          fill: #CFE3F5;
          pointer-events: none;
        }
        .airtouch-simulator-root .tmp {
          font-family: inherit;
          font-size: 17px;
          font-weight: 800;
          pointer-events: none;
          font-variant-numeric: tabular-nums;
        }
        .airtouch-simulator-root .vent {
          fill: #EAF0F6;
          pointer-events: none;
        }
        .airtouch-simulator-root .air {
          fill: none;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-dasharray: 3 8;
          opacity: 0;
          pointer-events: none;
          animation: at5-drift var(--d, 1.4s) linear infinite;
        }
        .airtouch-simulator-root .airg.on .air {
          opacity: .8;
        }
        @keyframes at5-drift {
          to { stroke-dashoffset: -24px; }
        }

        .airtouch-simulator-root .scen {
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
        .airtouch-simulator-root .scen-h {
          font-family: inherit;
          font-weight: 700;
          font-size: .74rem;
          color: #BFE0F5;
          text-transform: uppercase;
          letter-spacing: .04em;
          margin-bottom: 2px;
        }
        .airtouch-simulator-root .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .airtouch-simulator-root .chip {
          border: 1px solid #2F5688;
          background: #0E2A4F;
          color: #CFE3F5;
          border-radius: 999px;
          padding: 4px 9px;
          font-family: inherit;
          font-weight: 600;
          font-size: .72rem;
          cursor: pointer;
          min-height: 26px;
          display: inline-flex;
          align-items: center;
          transition: background .15s, border-color .15s, color .15s;
        }
        .airtouch-simulator-root .chip:hover {
          border-color: #7FB6D9;
        }
        .airtouch-simulator-root .chip[aria-pressed="true"] {
          background: #F2A516;
          border-color: #F2A516;
          color: #0B2545;
          font-weight: 700;
        }
        .airtouch-simulator-root .scen-d {
          margin: 1px 0 3px;
          font-size: .72rem;
          color: #8FA6C0;
          line-height: 1.3;
          min-height: 1.6em;
        }
        .airtouch-simulator-root .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5px;
        }
        .airtouch-simulator-root .stats div {
          background: #0A1D38;
          border: 1px solid #1E3A63;
          border-radius: 8px;
          padding: 5px 7px;
        }
        .airtouch-simulator-root .stats span {
          display: block;
          font-size: .62rem;
          color: #7B8FA8;
          text-transform: uppercase;
          letter-spacing: .02em;
          line-height: 1.2;
        }
        .airtouch-simulator-root .stats b {
          font-family: inherit;
          font-weight: 800;
          font-size: 1.12rem;
          color: #EAF0F6;
          font-variant-numeric: tabular-nums;
          display: block;
          margin-top: 2px;
        }
        .airtouch-simulator-root .legend {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px 10px;
          font-size: .68rem;
          color: #8FA6C0;
        }
        .airtouch-simulator-root .lg {
          width: 9px;
          height: 9px;
          border-radius: 2px;
          display: inline-block;
          margin-right: 4px;
          vertical-align: -1px;
        }
        .airtouch-simulator-root .lg.c {
          background: linear-gradient(135deg, #1A5F9A, #4FB3E6);
        }
        .airtouch-simulator-root .lg.h {
          background: linear-gradient(135deg, #B8501A, #F2A516);
        }
        .airtouch-simulator-root .lg.o {
          background: #3A2A38;
        }

        /* Pad - Sleek Wall Touch Controller */
        .airtouch-simulator-root .pad {
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
        .airtouch-simulator-root .pad-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: .72rem;
          color: #9FB2C8;
          padding-bottom: 2px;
          border-bottom: 1px solid rgba(42,74,117,.35);
        }
        .airtouch-simulator-root .pad-top b {
          font-family: inherit;
          font-weight: 800;
          font-size: .9rem;
        }
        .airtouch-simulator-root .setrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 4px;
        }
        .airtouch-simulator-root .step {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid #2F5688;
          background: #0E2A4F;
          color: #EAF0F6;
          font-family: inherit;
          font-weight: 600;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background .15s, transform .1s;
        }
        .airtouch-simulator-root .step:hover {
          background: #163E72;
        }
        .airtouch-simulator-root .step:active {
          transform: scale(.92);
        }
        .airtouch-simulator-root .big {
          text-align: center;
          font-family: inherit;
          font-weight: 800;
          font-size: 2.1rem;
          line-height: 1;
        }
        .airtouch-simulator-root .big span {
          background: linear-gradient(180deg, #fff, #9FD4F2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .airtouch-simulator-root .big sup {
          font-size: .9rem;
          font-weight: 700;
          vertical-align: baseline;
          position: relative;
          top: -0.4em;
          margin-left: 2px;
          color: #CFE3F5;
        }
        .airtouch-simulator-root .big small {
          display: block;
          font-family: inherit;
          font-weight: 600;
          font-size: .64rem;
          color: #7FB6D9;
          margin-top: 1px;
          letter-spacing: .04em;
          text-transform: uppercase;
        }
        .airtouch-simulator-root .seg {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #0E2A4F;
          border-radius: 6px;
          padding: 2px;
          gap: 2px;
        }
        .airtouch-simulator-root .seg button {
          border: 0;
          background: transparent;
          color: #9FB2C8;
          font-family: inherit;
          font-weight: 600;
          font-size: .72rem;
          padding: 4px;
          border-radius: 5px;
          cursor: pointer;
          transition: all .15s;
        }
        .airtouch-simulator-root .seg button[aria-pressed="true"] {
          background: #EAF0F6;
          color: #0B2545;
          font-weight: 700;
        }
        .airtouch-simulator-root .zr-list {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .airtouch-simulator-root .zr {
          background: #0E2240;
          border: 1px solid #1E3A63;
          border-radius: 8px;
          padding: 4px 8px;
          transition: border-color .15s;
        }
        .airtouch-simulator-root .zr:hover {
          border-color: #2F5688;
        }
        .airtouch-simulator-root .zr-top {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .airtouch-simulator-root .zr .n {
          font-weight: 600;
          font-size: .76rem;
          color: #EAF0F6;
        }
        .airtouch-simulator-root .zr .t {
          margin-left: auto;
          font-family: inherit;
          font-weight: 700;
          font-size: .72rem;
          color: #7FB6D9;
          font-variant-numeric: tabular-nums;
        }
        .airtouch-simulator-root .sw {
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
        .airtouch-simulator-root .sw::after {
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
        .airtouch-simulator-root .sw[aria-checked="true"] {
          background: #F2A516;
        }
        .airtouch-simulator-root .sw[aria-checked="true"]::after {
          transform: translateX(13px);
        }
        .airtouch-simulator-root .zr input[type=range] {
          width: 100%;
          height: 12px;
          margin: 1px 0 0;
          accent-color: #F2A516;
          cursor: pointer;
          display: block;
        }
        .airtouch-simulator-root .zr.off {
          opacity: .55;
        }
        .airtouch-simulator-root .zr.off .t {
          color: #7B8FA8;
        }
        .airtouch-simulator-root .load {
          background: rgba(14,36,66,.5);
          border: 1px solid #1E3A63;
          border-radius: 8px;
          padding: 6px 8px;
        }
        .airtouch-simulator-root .load-top {
          display: flex;
          justify-content: space-between;
          font-size: .7rem;
          color: #9FB2C8;
          margin-bottom: 3px;
        }
        .airtouch-simulator-root .load-top b {
          color: #F2A516;
          font-weight: 700;
        }
        .airtouch-simulator-root .meter {
          height: 4px;
          border-radius: 99px;
          background: #16294A;
          overflow: hidden;
        }
        .airtouch-simulator-root .meter i {
          display: block;
          height: 100%;
          width: 0;
          background: linear-gradient(90deg, #7FB6D9, #F2A516);
          transition: width .4s;
        }
        .airtouch-simulator-root .load p {
          margin: 3px 0 0;
          font-size: .66rem;
          color: #8FA6C0;
          line-height: 1.25;
        }
`}</style>

      <div className="sim" aria-label="AirTouch 5 zone control demo">
        {/* Header */}
        <div className="sim-head">
          <div>
            <h3>Try the AirTouch 5 controller</h3>
            <p>
              Tap a room or use the touchpad. Switch zones, change the temperature or flip between cooling and heating.
            </p>
          </div>
          <span className="live">
            <i />Interactive demo
          </span>
        </div>

        <div className="sim-body">
          {/* Left Column: Floorplan & Scenes */}
          <div className="leftcol">
            <div className="planbox">
              <svg className="plan" viewBox="0 0 420 300" role="group" aria-label="Floor plan with four zones">
                <defs>
                  <linearGradient id="at5-gC" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#1A5F9A" />
                    <stop offset="1" stopColor="#4FB3E6" />
                  </linearGradient>
                  <linearGradient id="at5-gH" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#B8501A" />
                    <stop offset="1" stopColor="#F2A516" />
                  </linearGradient>
                  <linearGradient id="at5-gO" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#2B2433" />
                    <stop offset="1" stopColor="#3B2C36" />
                  </linearGradient>
                </defs>

                {/* Interactive Clickable Rooms */}
                {zones.map((z, idx) => {
                  const fill = z.on ? (mode === 'cool' ? 'url(#at5-gC)' : 'url(#at5-gH)') : 'url(#at5-gO)';
                  const opacity = z.on ? (0.55 + (z.flow / 100) * 0.45).toFixed(2) : '1';
                  const textColor = z.on ? (mode === 'cool' ? '#FFFFFF' : '#FFF4DC') : '#B9A7B3';
                  const airStroke = mode === 'cool' ? '#CDEBFF' : '#FFD9A0';
                  const animDuration = (1.9 - (z.flow / 100) * 1.3).toFixed(2) + 's';

                  return (
                    <g key={z.id}>
                      <rect
                        id={`room-${idx}`}
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
                      <text className="lbl" x={z.x + 16} y={z.y + 30}>
                        {z.name}
                      </text>
                      <text className="tmp" x={z.x + 16} y={z.y + 58} fill={textColor}>
                        {z.on ? liveTemps[idx].toFixed(1) + '°' : 'Off'}
                      </text>
                      <rect
                        className="vent"
                        x={z.vent[0] - 9}
                        y={z.vent[1]}
                        width={18}
                        height={5}
                        rx={2}
                        opacity={z.on ? 1 : 0.3}
                      />
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

                {/* Furniture Outlines */}
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

          {/* Right Column: AirTouch 5 Wall Touchpad Simulation */}
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

            {/* Stepper & Temp Display */}
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

            {/* Mode Selector */}
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

            {/* Individual Room Zone Toggles & Sliders */}
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

            {/* System Load Percentage */}
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
  );
}

