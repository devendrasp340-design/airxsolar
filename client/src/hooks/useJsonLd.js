import { useEffect } from 'react';

/**
 * Injects a page-level <script type="application/ld+json"> into <head> and
 * removes it when the route unmounts (or the data changes), so structured
 * data never duplicates across client-side navigation. Pass null to skip.
 */
export default function useJsonLd(id, data) {
  const json = data ? JSON.stringify(data) : null;

  useEffect(() => {
    if (!json) return undefined;
    document.head.querySelectorAll(`script[data-jsonld="${id}"]`).forEach((el) => el.remove());

    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.jsonld = id;
    el.text = json;
    document.head.appendChild(el);

    return () => el.remove();
  }, [id, json]);
}
