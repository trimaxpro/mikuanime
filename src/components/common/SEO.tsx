import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video.movie' | 'video.tv_show' | 'video.other';
  keywords?: string[];
  schema?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

export const DEFAULT_TITLE = 'MikuAnime — Watch Anime Online in HD for Free';
export const DEFAULT_DESCRIPTION =
  'Stream popular anime free in HD on MikuAnime — subbed and dubbed. Follow weekly airing schedules, browse anime by genre, and sync your watchlist on any device.';
export const DEFAULT_IMAGE = 'https://www.mikuanime.site/logo.gif';
export const SITE_NAME = 'MikuAnime';
export const BASE_URL = 'https://www.mikuanime.site';

function exists(selector: string) {
  return document.querySelector(selector) !== null;
}

function updateMetaTag(attribute: 'name' | 'property', attrValue: string, content: string, overwrite = true) {
  const selector = `meta[${attribute}="${attrValue}"]`;
  let element = document.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attrValue);
    document.head.appendChild(element);
  } else if (!overwrite) {
    return;
  }
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

function updateHreflang(url: string) {
  const codes = ['en', 'x-default'];
  for (const code of codes) {
    let link = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${code}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', code);
      document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

/** Trim a description to 70-160 chars, cutting at a word boundary without leaving a dangling "…". */
export function buildDescription(raw: string, max = 158): string {
  const text = raw.trim().replace(/\s+/g, ' ');
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const trimmed = lastSpace > max * 0.7 ? text.slice(0, lastSpace) : cut;
  return `${trimmed.replace(/[,;:\s]+$/, '')}...`;
}

/** Minimal JSON serialisation that keeps & < > valid inside a <script> tag. */
function serializeLdJson(schema: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(schema)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

function updateJsonLd(schema?: Record<string, unknown> | Record<string, unknown>[]) {
  const containerId = 'miku-dynamic-jsonld';
  let container = document.getElementById(containerId) as HTMLDivElement | null;

  if (!schema || (Array.isArray(schema) && schema.length === 0)) {
    if (container) container.remove();
    return;
  }

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.dataset.seoPlugin = 'true';
    document.head.appendChild(container);
  }

  const blocks = (Array.isArray(schema) ? schema : [schema]).filter(Boolean);
  const currentIds = new Set<string>();

  for (const block of blocks) {
    const type = Array.isArray(block['@graph'])
      ? block['@graph'].map((n: Record<string, unknown>) => n?.['@type']).filter(Boolean).join(',')
      : String(block['@type'] || 'Graph');
    const key = type || 'block';
    currentIds.add(key);

    let script = container.querySelector<HTMLScriptElement>(`script[data-key="${key}"]`);
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.key = key;
      container.appendChild(script);
    }
    script.textContent = serializeLdJson(block);
  }

  for (const node of Array.from(container.querySelectorAll('script[data-key]'))) {
    const key = node.getAttribute('data-key') as string;
    if (!currentIds.has(key)) node.remove();
  }
}

function updateRobots(noindex: boolean) {
  if (noindex) {
    updateMetaTag('name', 'robots', 'noindex, nofollow');
    updateMetaTag('name', 'googlebot', 'noindex, nofollow');
  } else if (exists('meta[name="robots"]') || exists('meta[name="googlebot"]')) {
    document.querySelectorAll('meta[name="robots"], meta[name="googlebot"]').forEach((el) => el.remove());
  }
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  keywords = [],
  schema,
  noindex = false,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    // 1. Page Title
    const formattedTitle = title
      ? title.includes(SITE_NAME)
        ? title
        : `${title} — ${SITE_NAME}`
      : DEFAULT_TITLE;
    document.title = formattedTitle;

    // 2. Canonical URL
    const canonicalUrl = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${BASE_URL}${canonical}`
      : `${BASE_URL}${location.pathname}`;
    updateCanonicalLink(canonicalUrl);
    updateHreflang(canonicalUrl);

    // 3. Meta Description (target 70-160 chars)
    const trimmedDesc = description.length > 160 ? buildDescription(description) : description.trim();

    // 4. Robots
    updateRobots(noindex);

    // 5. Meta Keywords
    if (keywords.length > 0) {
      updateMetaTag(
        'name',
        'keywords',
        [...new Set(keywords.concat(['anime', 'streaming', 'watch anime', 'subbed', 'dubbed', 'MikuAnime']))].join(', '),
      );
    }

    // 6. OpenGraph Tags
    updateMetaTag('property', 'og:title', formattedTitle);
    updateMetaTag('property', 'og:description', trimmedDesc, false);
    updateMetaTag('property', 'og:url', canonicalUrl);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:image:width', '1200');
    updateMetaTag('property', 'og:image:height', '630');
    updateMetaTag('property', 'og:image:alt', title ? title.replace(/\s*—\s*MikuAnime$/, '') : SITE_NAME);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:site_name', SITE_NAME);

    // 7. Twitter Card Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', formattedTitle);
    updateMetaTag('name', 'twitter:description', trimmedDesc, false);
    updateMetaTag('name', 'twitter:image', ogImage);

    // 8. Structured Data (JSON-LD)
    updateJsonLd(schema);
  }, [title, description, canonical, ogImage, ogType, keywords, schema, noindex, location.pathname]);

  return null;
}