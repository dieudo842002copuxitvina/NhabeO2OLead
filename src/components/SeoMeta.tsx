"use client";

import { useEffect } from 'react';

interface SeoMetaProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object;
}

/**
 * Lightweight SEO head manager — sets title, meta description, canonical, OG tags, and JSON-LD.
 * No external dependency (avoids react-helmet bundle).
 */
export default function SeoMeta({ title, description, canonical, ogImage, jsonLd }: SeoMetaProps) {
  useEffect(() => {
    document.title = title;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (ogImage) {
      setMeta('property', 'og:image', ogImage);
      setMeta('name', 'twitter:image', ogImage);
    }

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    let scriptEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.text = JSON.stringify(jsonLd);
      scriptEl.dataset.seoLanding = 'true';
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };
  }, [title, description, canonical, ogImage, JSON.stringify(jsonLd)]);

  return null;
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}
