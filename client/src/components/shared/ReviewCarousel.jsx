import React, { useState, useEffect, useCallback } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, ExternalLink } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah M.',
    location: 'Joondalup',
    rating: 5,
    text: 'AirXSolar installed our Daikin split system in just 3 hours. The team was professional, clean and explained everything. Best AC experience in Perth!',
    date: '2 weeks ago',
  },
  {
    name: 'James T.',
    location: 'Fremantle',
    rating: 5,
    text: "Got the ducted system with AirTouch 5. Absolute game changer — we can control every room from our phones. Worth every cent. Highly recommend!",
    date: '1 month ago',
  },
  {
    name: 'Priya K.',
    location: 'Canning Vale',
    rating: 5,
    text: 'Cheapest quote we got for a Mitsubishi Electric system and the installation was flawless. The 10-year warranty gives great peace of mind.',
    date: '3 weeks ago',
  },
  {
    name: 'David L.',
    location: 'Rockingham',
    rating: 5,
    text: 'Called for an emergency repair during a heatwave. They came same day and fixed our unit. Lifesavers! Very fair pricing too.',
    date: '1 month ago',
  },
  {
    name: 'Emma R.',
    location: 'Armadale',
    rating: 5,
    text: 'We had 3 split systems installed across our home. The crew was punctual, tidy, and incredibly helpful. Best price in Perth metro area.',
    date: '2 months ago',
  },
];

export default function ReviewCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % reviews.length);
  }, []);

  const prev = () => {
    setCurrent((p) => (p - 1 + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading font-bold text-2xl lg:text-3xl text-navy mb-2">
            What Perth Families Say About Our Air Conditioning
          </h2>
          <div className="flex items-center justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 text-amber fill-amber" />
            ))}
            <a
              href="https://maps.app.goo.gl/J8PPST9JEvabcBGD6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-navy/70 hover:text-amber text-sm font-semibold ml-2 underline"
            >
              5.0 on Google (12 reviews) <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Review card */}
          <div
            className="bg-slate rounded-2xl p-6 lg:p-8 min-h-[200px] flex flex-col justify-between"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <Quote className="w-8 h-8 text-amber/30 mb-4" />
            <p className="text-navy/80 text-base lg:text-lg leading-relaxed mb-6">
              "{reviews[current].text}"
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-navy">{reviews[current].name}</p>
                <p className="text-navy/50 text-sm">{reviews[current].location} · {reviews[current].date}</p>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: reviews[current].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber fill-amber" />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate hover:bg-navy hover:text-white transition-colors"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="min-w-[32px] min-h-[32px] flex items-center justify-center p-1"
                  aria-label={`Go to review ${i + 1}`}
                >
                  <span
                    className={`block w-2.5 h-2.5 rounded-full transition-colors ${
                      i === current ? 'bg-amber w-3 h-3' : 'bg-navy/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              onClick={next}
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate hover:bg-navy hover:text-white transition-colors"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
