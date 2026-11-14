import React, { useState } from 'react';
import QuoteModal from './QuoteModal';

export default function ProductCard({ product }) {
  const [quoteOpen, setQuoteOpen] = useState(false);

  const {
    brand,
    model,
    product_name,
    capacity_kw,
    price_aud,
    image_path,
  } = product;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-slate overflow-hidden">
          <img
            src={image_path || '/images/placeholder-product.jpg'}
            alt={product_name || `${brand} ${model}`}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
          {brand && (
            <span className="absolute top-3 left-3 bg-navy text-white text-xs font-bold px-2.5 py-1 rounded-md">
              {brand}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-heading font-bold text-navy text-sm line-clamp-2 mb-1">
            {product_name || `${brand} ${model}`}
          </h3>
          {capacity_kw && (
            <p className="text-navy/50 text-xs mb-2">{capacity_kw} kW</p>
          )}
          <div className="flex flex-wrap sm:flex-nowrap items-end justify-between gap-2.5 mt-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading font-extrabold text-navy text-lg leading-tight">
                  ${price_aud?.toLocaleString()}
                </span>
                <span className="text-navy/60 text-xs font-semibold leading-tight">
                  + GST
                </span>
              </div>
              <p className="text-[10px] text-amber-800 font-medium leading-tight mt-1">
                Install available at extra cost
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuoteOpen(true);
              }}
              className="bg-amber text-navy font-bold text-xs px-4 py-2.5 min-h-[44px] rounded-lg hover:bg-amber/90 transition-colors whitespace-nowrap flex items-center justify-center w-full sm:w-auto"
            >
              Get Free Quote
            </button>
          </div>
        </div>
      </div>

      <QuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        prefillProduct={product_name || `${brand} ${model}`}
      />
    </>
  );
}
