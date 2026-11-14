import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';

const serviceAreas = [
  'Joondalup', 'Fremantle', 'Rockingham', 'Armadale',
  'Midland', 'Mandurah', 'Canning Vale', 'Cannington',
];

const quickLinks = [
  { label: 'Ducted Systems', path: '/ducted-systems' },
  { label: 'Installation', path: '/installation' },
  { label: 'Repair & Service', path: '/repair-maintenance' },
  { label: 'Offers', path: '/offers' },
  { label: 'Blog', path: '/blog' },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center bg-white px-3.5 py-2 rounded-xl mb-4 shadow-sm hover:opacity-95 transition-opacity group"
            >
              <img
                src="/logo-horizontal.jpg"
                alt="AirXSolar"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-[1.02] transition-transform"
              />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Perth's trusted air conditioning specialists. Licensed installers with over a decade of experience in split and ducted systems.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/airxsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 min-w-[44px] min-h-[44px] bg-white/10 rounded-xl flex items-center justify-center hover:bg-amber hover:text-navy transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/airxsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 min-w-[44px] min-h-[44px] bg-white/10 rounded-xl flex items-center justify-center hover:bg-amber hover:text-navy transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/airxsolar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 min-w-[44px] min-h-[44px] bg-white/10 rounded-xl flex items-center justify-center hover:bg-amber hover:text-navy transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="inline-flex items-center min-h-[38px] text-white/70 hover:text-amber transition-colors text-sm py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Service Areas</h3>
            <div className="flex flex-wrap gap-2">
              {serviceAreas.map((area) => (
                <span
                  key={area}
                  className="inline-flex items-center min-h-[32px] bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full"
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contact Us</h3>
            <div className="space-y-2 sm:space-y-3">
              <a
                href="tel:+61481705789"
                className="flex items-center gap-2.5 text-white/70 hover:text-amber transition-colors text-sm min-h-[38px] py-1"
              >
                <Phone className="w-4 h-4 text-amber shrink-0" />
                0481 705 789
              </a>
              <a
                href="tel:+61468428494"
                className="flex items-center gap-2.5 text-white/70 hover:text-amber transition-colors text-sm min-h-[38px] py-1"
              >
                <Phone className="w-4 h-4 text-amber shrink-0" />
                0468 428 494
              </a>
              <a
                href="mailto:info@airxsolar.com.au"
                className="flex items-center gap-2.5 text-white/70 hover:text-amber transition-colors text-sm min-h-[38px] py-1"
              >
                <Mail className="w-4 h-4 text-amber shrink-0" />
                info@airxsolar.com.au
              </a>
              <a
                href="mailto:support@airxsolar.com.au"
                className="flex items-center gap-2.5 text-white/70 hover:text-amber transition-colors text-sm min-h-[38px] py-1"
              >
                <Mail className="w-4 h-4 text-amber shrink-0" />
                <span>support@airxsolar.com.au <span className="text-xs text-white/50">(Outside 45km)</span></span>
              </a>
              <div className="flex items-start gap-2.5 text-white/70 text-sm py-1">
                <Clock className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                <div>
                  <p>Mon–Fri: 8:00 AM – 5:00 PM AWST</p>
                  <p>Sat–Sun: Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-white/50 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} AirXSolar. All rights reserved. *Conditions apply to offers &amp; 10-year warranty.</p>
          <p>Licensed & Insured | ABN XX XXX XXX XXX</p>
        </div>
      </div>
    </footer>
  );
}
