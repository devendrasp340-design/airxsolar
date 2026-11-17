import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How much does a split system cost in Perth?',
    answer:
      'Split system prices start from $657 + GST for a TECO 2.64 kW unit. Premium brands like Daikin and Mitsubishi Electric range from $1,200 to $3,500 + GST depending on capacity. All prices are supply only — installation is quoted separately based on your property.',
  },
  {
    question: 'What size air conditioner do I need for my Perth home?',
    answer:
      'As a general guide: small rooms (up to 20m²) need 2.5–3.5 kW, medium rooms (20–40m²) need 5–7 kW, and large open areas (40–60m²) need 7–9 kW. Perth\'s hot summers mean you should size up rather than down. We offer free site inspections to recommend the perfect size.',
  },
  {
    question: 'How long does air conditioner installation take?',
    answer:
      'A standard split system installation takes 2–4 hours. Ducted systems typically take 1–2 days depending on the size of your home and existing infrastructure. We always aim for minimal disruption.',
  },
  {
    question: 'Do you service all Perth metro areas?',
    answer:
      'Yes! We cover the entire Perth metro area including Joondalup, Fremantle, Rockingham, Armadale, Midland, Mandurah, Canning Vale, Cannington, and everywhere in between. Free delivery within 45km of Perth CBD.',
  },
  {
    question: 'What brands do you carry?',
    answer:
      'We stock all major brands: Daikin, Mitsubishi Electric, Mitsubishi Heavy Industries (MHI), Fujitsu Airstage, Hisense, and TECO. Each brand offers different advantages — we\'ll help you choose the best fit for your needs and budget.',
  },
  {
    question: 'What does the 10-year warranty cover?',
    answer:
      'Our 10-year warranty covers parts and compressor for eligible systems (conditions apply). Manufacturer warranties vary by brand, and we\'ll explain all terms and conditions clearly during your quote.',
  },
  {
    question: 'How often should I service my air conditioner in Perth?',
    answer:
      'We recommend servicing your AC at least once a year — ideally before summer. Regular maintenance extends the lifespan of your unit, improves efficiency (saving you money on power bills), and ensures healthy air quality. Perth\'s dusty conditions make regular filter cleaning especially important.',
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 lg:py-16 bg-slate">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="font-heading font-bold text-2xl lg:text-3xl text-navy text-center mb-10">
          Perth Air Conditioning FAQs
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate/50 transition-colors"
              >
                <span className="font-heading font-semibold text-navy text-sm lg:text-base pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-navy/40 shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 animate-fade-in">
                  <p className="text-navy/70 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
