import React, { useState, useEffect } from 'react';

const LINE_THREE_PHRASES = [
  'Unbeatable AC Deals',
  'Daikin 10.0kW Ducted',
  'Split Units From $657',
  '10-Year Warranty Care',
];

export default function HeroTypingHeadline() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charCount, setCharCount] = useState(LINE_THREE_PHRASES[0].length);
  const [phase, setPhase] = useState('pause'); // 'typing' | 'pause' | 'deleting'

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setPhraseIdx(0);
      setCharCount(LINE_THREE_PHRASES[0].length);
      return;
    }

    const currentPhrase = LINE_THREE_PHRASES[phraseIdx];
    let timer;

    if (phase === 'pause') {
      timer = setTimeout(() => setPhase('deleting'), 2400);
    } else if (phase === 'deleting') {
      if (charCount > 0) {
        timer = setTimeout(() => setCharCount((c) => c - 1), 26);
      } else {
        setPhraseIdx((idx) => (idx + 1) % LINE_THREE_PHRASES.length);
        setPhase('typing');
      }
    } else if (phase === 'typing') {
      if (charCount < currentPhrase.length) {
        timer = setTimeout(() => setCharCount((c) => c + 1), 46);
      } else {
        setPhase('pause');
      }
    }

    return () => clearTimeout(timer);
  }, [charCount, phase, phraseIdx]);

  const typedText = LINE_THREE_PHRASES[phraseIdx].slice(0, charCount);

  return (
    <h1 className="font-heading font-extrabold text-2xl xs:text-3xl sm:text-4xl lg:text-[2.45rem] leading-[1.15] tracking-tight mb-4 text-white">
      <span className="sr-only">
        Perth Air Conditioning Installation: Stay Cool This Perth Summer With Unbeatable Split &amp; Ducted AC Deals
      </span>

      <span aria-hidden="true" className="block">
        <span className="block text-white">Stay Cool This Perth</span>
        <span className="block text-white/95">
          Summer{' '}
          <span className="inline-flex items-center gap-2">
            <span>With</span>
            <span className="hidden sm:inline-block h-[3px] w-8 rounded-full bg-amber/80 align-middle" />
          </span>
        </span>
        <span className="relative inline-block min-h-[1.2em] text-amber mt-0.5">
          <span>{typedText}</span>
          <span
            className="inline-block w-[3px] h-[0.88em] bg-amber rounded-full align-middle ml-1 animate-caret"
          />
          {/* Subtle architectural underline accent */}
          <svg
            viewBox="0 0 260 10"
            preserveAspectRatio="none"
            className="block w-full h-2 mt-0.5 text-amber/60"
            aria-hidden="true"
          >
            <path
              d="M2 7 Q 130 1 258 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
    </h1>
  );
}

