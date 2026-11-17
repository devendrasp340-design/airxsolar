import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Wind,
  Wrench,
  Package,
  ArrowRight,
  Phone,
  Sparkles,
  ShieldCheck,
  Zap,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Search,
  X,
} from 'lucide-react';
import QuoteModal from '../components/shared/QuoteModal';
import ProductCard from '../components/shared/ProductCard';
import TrustBar from '../components/shared/TrustBar';
import ReviewCarousel from '../components/shared/ReviewCarousel';
import FAQAccordion from '../components/shared/FAQAccordion';
import HeroTypingHeadline from '../components/shared/HeroTypingHeadline';
import useSEO from '../hooks/useSEO';

const splitHighlights = [
  'Reverse cycle heating & cooling',
  'Whisper-quiet inverters down to 19 dB',
  'Daikin, Mitsubishi, Fujitsu, Hisense, MHI & TECO',
  'Installation service available at extra cost',
];

const ductedHighlights = [
  'AirTouch 5 smart touchscreen zoning',
  '6–8 ceiling outlets & acoustic ductwork',
  'Turnkey ARC-licensed Perth installation',
];

const BRANDS = [
  'Daikin',
  'Mitsubishi Electric',
  'MHI',
  'Fujitsu Airstage',
  'Hisense',
  'TECO',
];

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'capacity_asc', label: 'Capacity: Small to Large' },
  { value: 'capacity_desc', label: 'Capacity: Large to Small' },
];

function FilterPanel({
  searchQuery,
  setSearchQuery,
  selectedBrands,
  toggleBrand,
  maxCapacity,
  setMaxCapacity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  resetFilters,
}) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block font-heading font-bold text-sm text-navy mb-2">Search</label>
        <div className="relative">
          <Search className="w-4 h-4 text-navy/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Model or brand..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
      </div>

      {/* Brands */}
      <div>
        <label className="block font-heading font-bold text-sm text-navy mb-2">Brand</label>
        <div className="space-y-2">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 text-sm text-navy/80 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="rounded border-gray-300 text-amber focus:ring-amber"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Capacity Slider */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-heading font-bold text-navy">Max Capacity</span>
          <span className="font-semibold text-amber">{maxCapacity} kW</span>
        </div>
        <input
          type="range"
          min="2"
          max="25"
          step="0.5"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(Number(e.target.value))}
          className="w-full accent-amber"
        />
        <div className="flex justify-between text-xs text-navy/50 mt-1">
          <span>2 kW</span>
          <span>25 kW</span>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="block font-heading font-bold text-sm text-navy mb-2">
          Price Range ($ + GST)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min $"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max $"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={resetFilters}
        className="w-full py-2.5 min-h-[44px] text-xs font-bold text-navy/70 hover:text-navy border border-gray-200 rounded-lg transition-colors hover:bg-slate flex items-center justify-center cursor-pointer"
      >
        Reset All Filters
      </button>
    </div>
  );
}

export default function HomePage() {
  useSEO({
    title: 'Air Conditioning Installation Perth | Split & Ducted | AirXSolar',
    description:
      'Perth air conditioning installation & servicing. Split systems from $657 + GST, Daikin ducted $9,500 + GST installed. Licensed installers. Free quote.',
    path: '/',
  });
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState('');
  const [blogs, setBlogs] = useState([]);

  // Products Catalogue State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxCapacity, setMaxCapacity] = useState(25);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sortBy) params.set('sort', sortBy);

    fetch(`/api/products?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error('API request failed');
        return r.json();
      })
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        } else {
          throw new Error('No products returned');
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to static catalogue data (enables offline/GitHub Pages/Vercel previews)
        import('../data/productsFallback.json')
          .then((m) => {
            setProducts(m.default || []);
            setLoading(false);
          })
          .catch(() => {
            setProducts([]);
            setLoading(false);
          });
      });
  }, [sortBy]);

  // Fetch blogs
  useEffect(() => {
    fetch('/api/blogs')
      .then((r) => (r.ok ? r.json() : { blogs: [] }))
      .then((data) => setBlogs((data.blogs || []).slice(0, 3)))
      .catch(() => setBlogs([]));
  }, []);

  // Handle direct hash navigation to #products
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#products') {
        setTimeout(() => {
          document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openQuote = (product) => {
    setQuoteProduct(product);
    setQuoteOpen(true);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setSelectedBrands([]);
    setMaxCapacity(25);
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (selectedBrands.length > 0) {
        const prodBrand = (p.brand || '').toLowerCase();
        const brandMatch = selectedBrands.some((b) => {
          const target = b.toLowerCase();
          if (target === 'mhi') return prodBrand.includes('mhi') || prodBrand.includes('mitsubishi heavy');
          return prodBrand === target;
        });
        if (!brandMatch) return false;
      }
      if (p.capacity_kw && Number(p.capacity_kw) > maxCapacity) {
        return false;
      }
      if (minPrice !== '' && Number(p.price_aud) < Number(minPrice)) {
        return false;
      }
      if (maxPrice !== '' && Number(p.price_aud) > Number(maxPrice)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${p.brand} ${p.model} ${p.product_name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price_aud || 0) - (b.price_aud || 0);
      if (sortBy === 'price_desc') return (b.price_aud || 0) - (a.price_aud || 0);
      if (sortBy === 'capacity_asc') return (a.capacity_kw || 0) - (b.capacity_kw || 0);
      if (sortBy === 'capacity_desc') return (b.capacity_kw || 0) - (a.capacity_kw || 0);
      return 0;
    });
  }, [products, selectedBrands, maxCapacity, minPrice, maxPrice, searchQuery, sortBy]);

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
  };

  const closeDetailModal = () => {
    setSelectedProduct(null);
  };

  const getProductImages = (product) => {
    if (!product) return [];
    const imgs = [
      product.image_path,
      product.image2_path,
      product.image3_path,
      product.image4_path,
      product.image5_path,
    ].filter(Boolean);
    return imgs.length > 0 ? imgs : ['/images/placeholder-product.jpg'];
  };

  const filterProps = {
    searchQuery,
    setSearchQuery,
    selectedBrands,
    toggleBrand,
    maxCapacity,
    setMaxCapacity,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    resetFilters,
  };

  const detailImages = getProductImages(selectedProduct);

  return (
    <div>
      {/* Hero Banner — Clean Full-Width Edge-to-Edge Split Layout */}
      <section className="bg-navy text-white relative overflow-hidden w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch w-full">
          {/* Left 5 Columns: Crisp Navy Headline Panel */}
          <div className="lg:col-span-5 px-6 sm:px-10 lg:pl-10 xl:pl-16 2xl:pl-24 lg:pr-6 py-10 lg:py-14 flex flex-col justify-center order-2 lg:order-1">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 bg-amber text-navy text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Perth Air Conditioning Specialists
              </span>
              <HeroTypingHeadline />
              <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-6">
                Supply &amp; licensed installation across Perth metro. Fast quotes, top brands, and 10-year warranty peace of mind <span className="text-white/60 text-xs sm:text-sm">(conditions apply)</span>.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openQuote('Free Air Conditioning Quote')}
                  className="bg-amber text-navy font-bold px-5 py-3.5 min-h-[48px] rounded-xl hover:bg-amber/90 transition-colors inline-flex items-center justify-center gap-2 text-sm shadow-md w-full sm:w-auto cursor-pointer"
                >
                  Get a Free Quote <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="tel:+61481705789"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 min-h-[48px] rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-sm border border-white/15 w-full sm:w-auto"
                >
                  <Phone className="w-4 h-4 text-amber" />
                  0481 705 789
                </a>
              </div>
            </div>
          </div>

          {/* Right 7 Columns: Pure Unobstructed Photo — Edge-to-Edge Full Bleed */}
          <div className="lg:col-span-7 relative order-1 lg:order-2">
            <div className="relative w-full h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[430px] overflow-hidden">
              <img
                src="/hero-bg.webp"
                alt="Perth family relaxing under cool split-system air conditioning"
                fetchPriority="high"
                className="w-full h-full object-cover object-top"
              />
              {/* Subtle left feather into navy on desktop only */}
              <div
                aria-hidden="true"
                className="hidden lg:block absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-navy to-transparent pointer-events-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dual Offer Spotlight Cards */}
      <section className="bg-slate py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
            {/* Card A: Split System */}
            <div className="bg-white text-navy rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between border-2 border-navy/5 hover:border-amber transition-all h-full">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="bg-slate text-navy font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Split Systems
                  </span>
                  <span className="text-xs font-semibold text-navy/60">
                    Entry Model: TECO 2.64 kW
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-2xl text-navy mb-3.5">
                  Split Systems from <span className="text-amber">$657 + GST*</span>
                </h2>

                <ul className="space-y-2 mb-5">
                  {splitHighlights.map((text) => (
                    <li key={text} className="flex items-center gap-2.5 text-xs sm:text-sm text-navy/85 font-medium">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-navy/5">
                <button
                  onClick={() => openQuote('Split System (from $657 + GST)')}
                  className="w-full bg-amber text-navy font-bold py-3.5 min-h-[48px] px-4 rounded-xl hover:bg-amber/90 transition-colors flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  Get a Free Split System Quote
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <div className="flex items-center justify-between text-xs text-navy/60">
                  <a
                    href="#products"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="font-semibold hover:text-navy underline min-h-[38px] inline-flex items-center py-1 cursor-pointer"
                  >
                    Browse all 65+ units
                  </a>
                  <a href="tel:+61481705789" className="inline-flex items-center gap-1 font-semibold hover:text-navy min-h-[38px] py-1">
                    <Phone className="w-3.5 h-3.5 text-amber" /> 0481 705 789
                  </a>
                </div>
                <p className="text-center text-[10px] text-navy/40">
                  *Conditions apply.
                </p>
              </div>
            </div>

            {/* Card B: Daikin Ducted Offer */}
            <div className="bg-navy text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between border-2 border-amber relative h-full">
              <div className="absolute -top-3 right-5 bg-amber text-navy font-extrabold text-[11px] px-3 py-0.5 rounded-full uppercase shadow">
                Most Popular Package
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="bg-white/10 text-amber font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Ducted Reverse Cycle
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-2xl mb-1">
                  Daikin 10.0 kW + AirTouch 5
                </h2>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-heading font-extrabold text-2xl text-amber">
                    $9,500 + GST*
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-white/80">
                    Fully Installed
                  </span>
                </div>

                <ul className="space-y-2 mb-5">
                  {ductedHighlights.map((text) => (
                    <li key={text} className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90 font-medium">
                      <CheckCircle className="w-4 h-4 text-amber shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-white/10">
                <button
                  onClick={() => openQuote('Daikin 10.0 kW + AirTouch 5 ($9,500 + GST Fully Installed)')}
                  className="w-full bg-amber text-navy font-bold py-3.5 min-h-[48px] px-4 rounded-xl hover:bg-amber/90 transition-colors flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  Claim This Ducted Offer
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <Link to="/ducted-systems" className="font-semibold hover:text-amber underline min-h-[38px] inline-flex items-center py-1">
                    View package inclusions
                  </Link>
                  <a href="tel:+61468428494" className="inline-flex items-center gap-1 font-semibold hover:text-amber min-h-[38px] py-1">
                    <Phone className="w-3.5 h-3.5 text-amber" /> 0468 428 494
                  </a>
                </div>
                <p className="text-center text-[10px] text-white/40">
                  *Conditions apply.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Service Quick-Nav Cards */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-navy">
              Complete Air Conditioning Solutions in Perth
            </h2>
            <p className="text-navy/60 text-xs sm:text-sm lg:text-base mt-1.5 md:mt-2">
              Supply, installation, and servicing across all Perth suburbs
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
            {/* Card 1: AC Products */}
            <a
              href="#products"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group bg-slate rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 hover:bg-navy hover:text-white transition-all duration-300 cursor-pointer flex flex-col justify-between text-center md:text-left border border-navy/5 hover:border-amber/80 shadow-sm"
            >
              <div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-amber rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-2 sm:mb-3 md:mb-4 shrink-0 shadow-sm">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-navy" />
                </div>
                <h3 className="font-heading font-extrabold text-xs sm:text-sm md:text-xl text-navy group-hover:text-white mb-1 md:mb-2 leading-tight">
                  Explore AC Products
                </h3>
                <p className="text-[10px] sm:text-xs text-navy/70 group-hover:text-white/80 line-clamp-1 md:hidden">
                  65+ Split &amp; Ducted
                </p>
                <p className="hidden md:block text-sm opacity-75 mb-4">
                  Compare 65+ split and ducted models from Daikin, Mitsubishi Electric, Fujitsu, MHI, Hisense &amp; TECO.
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="md:hidden inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-amber">
                  View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-amber">
                  View Products <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </a>

            {/* Card 2: Fast Installation */}
            <Link
              to="/installation"
              className="group bg-slate rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 hover:bg-navy hover:text-white transition-all duration-300 cursor-pointer flex flex-col justify-between text-center md:text-left border border-navy/5 hover:border-amber/80 shadow-sm"
            >
              <div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-amber rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-2 sm:mb-3 md:mb-4 shrink-0 shadow-sm">
                  <Wind className="w-5 h-5 md:w-6 md:h-6 text-navy" />
                </div>
                <h3 className="font-heading font-extrabold text-xs sm:text-sm md:text-xl text-navy group-hover:text-white mb-1 md:mb-2 leading-tight">
                  Fast Installation
                </h3>
                <p className="text-[10px] sm:text-xs text-navy/70 group-hover:text-white/80 line-clamp-1 md:hidden">
                  2–4h Install WA Techs
                </p>
                <p className="hidden md:block text-sm opacity-75 mb-4">
                  Licensed WA technicians. Standard split systems installed in 2–4 hours with clean workmanship guaranteed.
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="md:hidden inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-amber">
                  Info <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-amber">
                  Installation Info <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Card 3: Repair & Servicing */}
            <Link
              to="/repair-maintenance"
              className="group bg-slate rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-6 hover:bg-navy hover:text-white transition-all duration-300 cursor-pointer flex flex-col justify-between text-center md:text-left border border-navy/5 hover:border-amber/80 shadow-sm"
            >
              <div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-amber rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-2 sm:mb-3 md:mb-4 shrink-0 shadow-sm">
                  <Wrench className="w-5 h-5 md:w-6 md:h-6 text-navy" />
                </div>
                <h3 className="font-heading font-extrabold text-xs sm:text-sm md:text-xl text-navy group-hover:text-white mb-1 md:mb-2 leading-tight">
                  Repair &amp; Servicing
                </h3>
                <p className="text-[10px] sm:text-xs text-navy/70 group-hover:text-white/80 line-clamp-1 md:hidden">
                  Regas &amp; Cleans
                </p>
                <p className="hidden md:block text-sm opacity-75 mb-4">
                  Same-day fault diagnostics, regassing, and seasonal cleans to keep your AC running efficiently.
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="md:hidden inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold text-amber">
                  Book <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-sm font-bold text-amber">
                  Book a Service <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Embedded Full Product Catalogue — Air Conditioning Range */}
      <section id="products" className="py-12 lg:py-16 bg-slate/40 border-y border-slate-200/60 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header with Integrated Ducted Promo & Sort */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
            {/* Left: Heading & Count */}
            <div className="shrink-0">
              <span className="text-amber-700 font-extrabold text-xs uppercase tracking-wider block mb-1">
                COMPREHENSIVE PERTH CATALOGUE
              </span>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-navy tracking-tight">
                Split System Air Conditioner Range
              </h2>
              <p className="text-navy/60 text-sm mt-1">
                Showing {filteredProducts.length} units
              </p>
            </div>

            {/* Center: Whole-Home Ducted Promo Banner */}
            <div className="flex justify-center items-center flex-1 my-2 lg:my-0 w-full sm:w-auto">
              <div className="w-full sm:w-auto min-h-[48px] py-2.5 sm:py-0 px-4 bg-navy text-white rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-start gap-3 sm:gap-4 border border-amber/30 shadow-sm shrink-0">
                <div className="flex flex-col justify-center text-left">
                  <span className="text-xs font-bold text-white leading-tight tracking-wide">
                    Prefer Whole-Home Ducted?
                  </span>
                  <span className="text-[11px] text-white/80 leading-tight mt-0.5">
                    Daikin 10 kW + AirTouch 5 from <strong className="text-amber font-bold">$9,500 + GST</strong>
                  </span>
                </div>
                <Link
                  to="/ducted-systems"
                  className="h-9 sm:h-8 bg-amber hover:bg-amber/90 text-navy font-bold px-3.5 rounded-lg text-xs transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 hover:scale-105"
                >
                  <span>Explore Ducted Offer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Filters & Custom Sort Dropdown */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden h-12 flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white px-4 rounded-xl text-sm font-semibold text-navy border border-gray-200 shadow-sm shrink-0 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div ref={sortDropdownRef} className="relative flex-1 sm:flex-none shrink-0">
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen((prev) => !prev)}
                  className={`h-12 w-full sm:w-auto bg-white pl-4 pr-3.5 rounded-xl text-sm font-semibold text-navy border shadow-sm flex items-center justify-between gap-3 shrink-0 cursor-pointer transition-all ${
                    sortDropdownOpen
                      ? 'border-amber ring-2 ring-amber/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-haspopup="listbox"
                  aria-expanded={sortDropdownOpen}
                >
                  <span>
                    {SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Price: Low to High'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-navy/60 transition-transform duration-200 ${
                      sortDropdownOpen ? 'rotate-180 text-amber' : ''
                    }`}
                  />
                </button>

                {sortDropdownOpen && (
                  <div
                    role="listbox"
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-30 animate-fade-in origin-top-right focus:outline-none"
                  >
                    {SORT_OPTIONS.map((option) => {
                      const isSelected = sortBy === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors rounded-lg cursor-pointer ${
                            isSelected
                              ? 'bg-amber/10 text-navy font-bold'
                              : 'text-navy/80 hover:bg-slate hover:text-navy font-medium'
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-amber shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Filter Sidebar — Professional Sticky Left Column */}
            <aside className="hidden lg:block w-64 shrink-0 self-start sticky top-28 z-20">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-navy/5 max-h-[calc(100vh-8.5rem)] overflow-y-auto overscroll-contain">
                <FilterPanel {...filterProps} />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
              <div className="lg:hidden bg-white rounded-2xl p-5 shadow-sm mb-4 animate-fade-in border border-gray-100">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate">
                  <h3 className="font-heading font-bold text-navy text-base">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg hover:bg-slate text-navy/60 cursor-pointer"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterPanel {...filterProps} />
              </div>
            )}

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="bg-white rounded-xl h-80 animate-pulse p-4 border border-gray-100">
                      <div className="bg-slate h-44 rounded-lg mb-4" />
                      <div className="bg-slate h-4 w-3/4 rounded mb-2" />
                      <div className="bg-slate h-4 w-1/2 rounded" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                  <p className="font-heading font-bold text-navy text-lg mb-2">
                    No matching products found
                  </p>
                  <p className="text-navy/60 text-sm mb-4">
                    Try adjusting your filters or ask us for a custom recommendation.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-amber text-navy font-bold px-5 py-2.5 min-h-[44px] rounded-lg text-sm hover:bg-amber/90 transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => openDetailModal(product)}
                      className="cursor-pointer"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Whole-Home Ducted Systems Marketing Spotlight Banner */}
          <div className="mt-12 lg:mt-16 bg-gradient-to-r from-navy via-navy to-[#0d315d] text-white rounded-2xl shadow-xl overflow-hidden border border-amber/30 relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Left Content Column */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 z-10">
                <div className="inline-flex items-center gap-2 bg-amber text-navy text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Whole-Home Climate Solution
                </div>

                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-2 leading-tight">
                  Looking for Whole-Home Ducted Air Conditioning in Perth?
                </h2>

                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-5 max-w-xl">
                  Experience invisible comfort across every room. Our flagship{' '}
                  <strong className="text-amber">Daikin 10.0 kW + Smart AirTouch 5</strong> package starts from just{' '}
                  <strong className="text-amber font-heading text-lg">$9,500 + GST</strong> fully installed across Perth with 10-year warranty care.
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-2.5 mb-6 text-xs text-white/90">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-amber" /> Smart AirTouch 5 Zone Control
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-amber" /> Up to 8 Independent Rooms
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-amber" /> Licensed Perth Installers
                  </span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link
                    to="/ducted-systems"
                    className="bg-amber hover:bg-amber/90 text-navy font-bold px-6 py-3.5 min-h-[48px] rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2 text-sm group text-center cursor-pointer"
                  >
                    <span>Explore Whole-Home Ducted Packages &amp; Pricing</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="tel:+61468428494"
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-3.5 min-h-[48px] rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-sm border border-white/15 cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-amber" />
                    <span>0468 428 494</span>
                  </a>
                </div>
              </div>

              {/* Right Visual Column */}
              <div className="lg:col-span-5 relative h-64 sm:h-72 lg:h-full min-h-[260px] overflow-hidden flex items-center justify-center p-4 lg:p-6">
                <Link
                  to="/ducted-systems"
                  className="relative w-full h-full max-h-[260px] rounded-xl overflow-hidden bg-navy/40 border border-white/10 shadow-inner flex items-center justify-center group block cursor-pointer"
                >
                  <img
                    src="/ducted-landing-page-model-3d.png"
                    alt="AirXSolar Whole Home Ducted Air Conditioning 3D Model with AirTouch 5 Zoning"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-semibold text-white/90 bg-navy/80 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                      See 3D Home Zoning in Action →
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <TrustBar />

      {/* Google Reviews */}
      <ReviewCarousel />

      {/* FAQ Accordion */}
      <FAQAccordion />

      {/* Latest Blog Preview */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading font-bold text-2xl lg:text-3xl text-navy">
                Perth Air Conditioning Tips &amp; Guides
              </h2>
              <p className="text-navy/60 text-sm mt-1">
                Expert advice to help you choose and maintain the right system
              </p>
            </div>
            <Link
              to="/blog"
              className="text-sm font-bold text-navy hover:text-amber inline-flex items-center gap-1"
            >
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {blogs.length === 0 ? (
            <div className="bg-slate rounded-2xl p-8 text-center">
              <p className="text-navy/60 text-sm mb-4">
                New cooling guides and Perth AC tips coming soon. Need advice right now?
              </p>
              <button
                onClick={() => openQuote('General AC Advice')}
                className="bg-amber text-navy font-bold px-6 py-3 rounded-lg text-sm hover:bg-amber/90 transition-colors cursor-pointer"
              >
                Speak With an Expert
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-slate rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {post.featured_image && (
                    <div className="aspect-[16/9] bg-navy/5 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-heading font-bold text-navy text-lg mb-2 line-clamp-2 group-hover:text-amber transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-navy/60 text-sm line-clamp-3">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal with 5-Image Gallery */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 modal-backdrop"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block bg-navy text-white text-xs font-bold px-2.5 py-1 rounded mb-2">
                  {selectedProduct.brand}
                </span>
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-navy">
                  {selectedProduct.product_name || `${selectedProduct.brand} ${selectedProduct.model}`}
                </h2>
              </div>
              <button
                onClick={closeDetailModal}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg hover:bg-slate cursor-pointer"
                aria-label="Close product modal"
              >
                <X className="w-5 h-5 text-navy/60" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Gallery */}
              <div>
                <div className="relative aspect-[4/3] bg-slate rounded-xl overflow-hidden mb-3">
                  <img
                    src={detailImages[activeImageIndex]}
                    alt={selectedProduct.product_name}
                    loading="lazy"
                    className="w-full h-full object-contain p-4"
                  />
                  {detailImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((i) => (i - 1 + detailImages.length) % detailImages.length)
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/95 shadow-md flex items-center justify-center hover:bg-amber transition-colors cursor-pointer"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5 text-navy" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((i) => (i + 1) % detailImages.length)
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/95 shadow-md flex items-center justify-center hover:bg-amber transition-colors cursor-pointer"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5 text-navy" />
                      </button>
                    </>
                  )}
                </div>

                {detailImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {detailImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 bg-slate cursor-pointer ${
                          idx === activeImageIndex ? 'border-amber' : 'border-transparent'
                        }`}
                      >
                        <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs & CTA */}
              <div className="flex flex-col justify-between">
                <div>
                  <div className="bg-slate rounded-xl p-4 mb-4">
                    <p className="text-xs text-navy/60 font-medium">Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-heading font-extrabold text-3xl text-navy">
                        ${selectedProduct.price_aud?.toLocaleString()}
                      </span>
                      <span className="text-base font-bold text-navy/60">+ GST</span>
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-navy mb-2">Specifications</h3>
                  <dl className="space-y-2 text-sm border-t border-gray-100 pt-2">
                    <div className="flex justify-between">
                      <dt className="text-navy/60">Brand</dt>
                      <dd className="font-semibold text-navy">{selectedProduct.brand}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-navy/60">Model</dt>
                      <dd className="font-semibold text-navy">{selectedProduct.model}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-navy/60">Type</dt>
                      <dd className="font-semibold text-navy">{selectedProduct.type || 'Split Units'}</dd>
                    </div>
                    {selectedProduct.capacity_kw && (
                      <div className="flex justify-between">
                        <dt className="text-navy/60">Capacity</dt>
                        <dd className="font-semibold text-navy">{selectedProduct.capacity_kw} kW</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-4 space-y-1.5 text-xs text-navy/70">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-amber" /> Free delivery within 45km of Perth CBD
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-amber" /> Installation service available at extra cost
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const name = selectedProduct.product_name || `${selectedProduct.brand} ${selectedProduct.model}`;
                    setSelectedProduct(null);
                    setQuoteProduct(name);
                    setQuoteOpen(true);
                  }}
                  className="mt-6 w-full bg-amber text-navy font-bold py-3.5 min-h-[48px] rounded-xl hover:bg-amber/90 transition-colors cursor-pointer"
                >
                  Get Free Quote for This Unit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Quote Modal */}
      <QuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        prefillProduct={quoteProduct}
      />
    </div>
  );
}
