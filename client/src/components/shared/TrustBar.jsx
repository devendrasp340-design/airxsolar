import React from 'react';
import { ShieldCheck, Truck, Award, Star } from 'lucide-react';

const trustItems = [
  {
    icon: ShieldCheck,
    label: 'Licensed & Insured',
    desc: 'Fully licensed WA installers',
  },
  {
    icon: Truck,
    label: 'Free Delivery 45km',
    desc: 'Free delivery within Perth metro',
  },
  {
    icon: Award,
    label: '10-Year Warranty',
    desc: 'Parts & compressor (conditions apply)',
  },
  {
    icon: Star,
    label: '5-Star Reviews',
    desc: 'Trusted by Perth families',
  },
];

export default function TrustBar() {
  return (
    <section className="bg-slate py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-14 h-14 bg-amber/10 rounded-xl flex items-center justify-center">
                <item.icon className="w-7 h-7 text-amber" />
              </div>
              <div>
                <p className="font-heading font-bold text-navy text-sm">{item.label}</p>
                <p className="text-navy/50 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
