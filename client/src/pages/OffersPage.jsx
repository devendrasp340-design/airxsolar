import React, { useState, useEffect } from 'react';
import { Tag, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import QuoteModal from '../components/shared/QuoteModal';
import useSEO from '../hooks/useSEO';

export default function OffersPage() {
  useSEO({
    title: 'Air Conditioning Deals Perth | Split & Ducted | AirXSolar',
    description:
      'Current Perth air conditioning specials on split systems and Daikin ducted packages, installed by licensed WA technicians. Prices ex GST. Free quote.',
    path: '/offers',
  });
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState('');

  useEffect(() => {
    fetch('/api/offers')
      .then((r) => (r.ok ? r.json() : { offers: [] }))
      .then((data) => {
        setOffers(data.offers || []);
        setLoading(false);
      })
      .catch(() => {
        setOffers([]);
        setLoading(false);
      });
  }, []);

  const claimOffer = (title) => {
    setSelectedOffer(title);
    setQuoteOpen(true);
  };

  return (
    <div className="bg-slate min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 bg-amber/20 text-navy text-xs font-extrabold px-3.5 py-1.5 rounded-full mb-3 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber" /> Limited Time Perth Specials
          </span>
          <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-navy mb-3">
            Current Perth Air Conditioning Offers
          </h1>
          <p className="text-navy/65 text-sm lg:text-base">
            All promotional prices are listed excluding GST. Request your free quote today to lock in these specials (conditions apply).
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse p-6" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center max-w-xl mx-auto shadow-sm">
            <Tag className="w-10 h-10 text-amber mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl text-navy mb-2">
              Daikin 10.0 kW + AirTouch 5 — $9,500 + GST
            </h2>
            <p className="text-navy/60 text-sm mb-6">
              Fully installed ducted package! Contact our team for current split and ducted specials.
            </p>
            <button
              onClick={() => claimOffer('Daikin 10.0 kW + AirTouch 5 ($9,500 + GST)')}
              className="bg-amber text-navy font-bold px-6 py-3.5 min-h-[48px] rounded-xl hover:bg-amber/90 transition-colors w-full sm:w-auto"
            >
              Get This Offer
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow flex flex-col justify-between border border-gray-100"
              >
                <div>
                  {offer.image_url ? (
                    <div className="bg-white p-3 flex items-center justify-center border-b border-slate overflow-hidden">
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        loading="lazy"
                        className="w-full max-h-[420px] object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="h-3 bg-amber" />
                  )}
                  <div className="p-6">
                    <span className="inline-flex items-center gap-1 bg-amber/15 text-navy text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                      <Tag className="w-3 h-3 text-amber" /> Special Offer
                    </span>
                    <h2 className="font-heading font-extrabold text-xl text-navy mb-2">
                      {offer.title}
                    </h2>
                    {offer.price_display && (
                      <p className="font-heading font-extrabold text-2xl text-amber mb-3">
                        {offer.price_display}
                      </p>
                    )}
                    {offer.description && (
                      <p className="text-navy/70 text-sm leading-relaxed mb-4">
                        {offer.description}
                      </p>
                    )}
                    {offer.ends_at && (
                      <p className="text-xs text-navy/50 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Valid until {new Date(offer.ends_at).toLocaleDateString('en-AU')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={() => claimOffer(offer.title)}
                    className="w-full bg-amber text-navy font-bold py-3.5 min-h-[48px] rounded-xl hover:bg-amber/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Get This Offer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        prefillProduct={selectedOffer}
      />
    </div>
  );
}
