import { SITE_URL } from '../hooks/useSEO';

const BUSINESS_ID = `${SITE_URL}/#business`;

// Manufacturer names for schema.org Brand (catalogue labels can differ).
const BRAND_NAMES = {
  'FUJITSU AIRSTAGE': 'Fujitsu',
  'Mitsubishi Heavy (MHI)': 'Mitsubishi Heavy Industries',
};

// Free delivery applies within ~45 km of the Perth CBD (Perth metro postcodes),
// not all of WA, so the $0 shipping rate is scoped to that postcode range.
const SHIPPING_DETAILS = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'AUD' },
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'AU',
    postalCodeRange: { postalCodeBegin: '6000', postalCodeEnd: '6199' },
  },
};

const absoluteUrl = (p) => (!p ? undefined : /^https?:\/\//i.test(p) ? p : `${SITE_URL}${p.startsWith('/') ? '' : '/'}${p}`);

const formatKw = (kw) => {
  const n = Number(kw);
  return Number.isInteger(n * 10) ? n.toFixed(1) : String(n);
};

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function offer({ price, url }) {
  const amount = String(Math.round(Number(price)));
  return {
    '@type': 'Offer',
    url,
    priceCurrency: 'AUD',
    price: amount,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: amount,
      priceCurrency: 'AUD',
      valueAddedTaxIncluded: false,
    },
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': BUSINESS_ID, name: 'AirXSolar' },
    shippingDetails: SHIPPING_DETAILS,
  };
}

export function splitSystemProduct(p) {
  const brand = BRAND_NAMES[p.brand] || p.brand;
  const name = p.product_name || `${p.brand} ${p.model}`;
  return {
    '@type': 'Product',
    '@id': `${SITE_URL}/#product-${slug(p.model)}`,
    name,
    image: absoluteUrl(p.image_path),
    description: `${brand} ${formatKw(p.capacity_kw)} kW split system air conditioner (model ${p.model}). Supplied in Perth, WA by AirXSolar with free delivery within 45 km of the Perth CBD; installation by licensed technicians available at extra cost. Price excludes GST.`,
    brand: { '@type': 'Brand', name: brand },
    category: 'Split System Air Conditioner',
    sku: p.model,
    mpn: p.model,
    offers: offer({ price: p.price_aud, url: `${SITE_URL}/#products` }),
  };
}

export const DUCTED_PRODUCT = {
  '@type': 'Product',
  '@id': `${SITE_URL}/ducted-systems#product`,
  name: 'Daikin 10.0 kW Ducted Reverse Cycle Air Conditioning + AirTouch 5 (Installed)',
  image: `${SITE_URL}/ducted-outdoor-unit.jpg`,
  description:
    'Daikin 10.0 kW ducted reverse cycle air conditioning package (10.0 kW cooling / 11.2 kW heating, R32 inverter) with AirTouch 5 touchpad, up to 8 damper zones and 6–8 ceiling outlets. Suits 3–4 bedroom homes. Fully installed across Perth, WA by ARC and WA electrical licensed technicians. Price excludes GST.',
  brand: { '@type': 'Brand', name: 'Daikin' },
  category: 'Ducted Air Conditioning',
  sku: 'DAIKIN-FDYAN100AV1-AT5',
  mpn: 'DAIKIN-FDYAN100AV1-AT5',
  offers: offer({ price: 9500, url: `${SITE_URL}/ducted-systems` }),
};

export const withContext = (graph) => ({ '@context': 'https://schema.org', '@graph': graph });
