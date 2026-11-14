import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Ducted Systems', path: '/ducted-systems' },
  { label: 'Installation', path: '/installation' },
  { label: 'Repair & Service', path: '/repair-maintenance' },
  { label: 'Offers', path: '/offers' },
  { label: 'Blog', path: '/blog' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
        scrolled
          ? 'shadow-lg shadow-navy/5'
          : 'border-b border-slate-100'
      }`}
    >
      {/* Top Bar: Full-width navy delivery & contact bar */}
      <div className="bg-navy text-white text-[11px] sm:text-xs md:text-sm w-full border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 sm:py-2 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
          <div className="text-white/90 text-center sm:text-left leading-tight">
            <span className="sm:hidden font-medium">Free Perth Delivery (45 km) · Mon–Fri 8am–5pm</span>
            <span className="hidden sm:inline">Free delivery within 45 km of Perth CBD · Mon–Fri 8am–5pm AWST</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2.5 sm:gap-3 font-bold shrink-0 leading-tight">
            <a
              href="tel:+61481705789"
              className="inline-flex items-center gap-1 text-amber hover:text-white transition-colors py-0.5 whitespace-nowrap"
              aria-label="Call 0481 705 789"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber shrink-0" />
              <span>0481 705 789</span>
            </a>
            <span className="text-white/30 text-[10px] sm:text-xs" aria-hidden="true">|</span>
            <a
              href="tel:+61468428494"
              className="inline-flex items-center gap-1 text-amber hover:text-white transition-colors py-0.5 whitespace-nowrap"
              aria-label="Call 0468 428 494"
            >
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber shrink-0" />
              <span>0468 428 494</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo-horizontal.png"
              alt="AirXSolar"
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-navy text-white'
                    : 'text-navy/70 hover:text-navy hover:bg-slate'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+61481705789"
              className="inline-flex items-center gap-2 bg-amber text-navy font-bold px-5 py-2.5 rounded-lg hover:bg-amber/90 transition-colors text-sm"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg hover:bg-slate transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6 text-navy" /> : <Menu className="w-6 h-6 text-navy" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-slate animate-fade-in shadow-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center min-h-[44px] px-4 py-2.5 rounded-lg text-base sm:text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-navy text-white'
                    : 'text-navy/70 hover:bg-slate'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-slate/50 space-y-2">
              <a
                href="tel:+61481705789"
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-amber text-navy font-bold rounded-lg text-sm"
              >
                <Phone className="w-4 h-4" />
                0481 705 789
              </a>
              <a
                href="tel:+61468428494"
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] bg-navy text-white font-bold rounded-lg text-sm"
              >
                <Phone className="w-4 h-4" />
                0468 428 494
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
