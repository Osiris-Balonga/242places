import { chapters, resources, type Locale } from './content.ts';
import { operationAddress, type ReferenceOperation } from './operations.ts';
import { preferenceBootstrap } from './preferences.ts';
import { brandMark } from './brand.ts';

export const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export const icon = (path: string) => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;

interface Page {
  title: string;
  slug: string;
  content: string;
  description?: string;
  scalarConfig?: Record<string, unknown>;
}

/** A single shell for guides and native Scalar operation pages. */
export function renderShell(locale: Locale, page: Page, operations: ReferenceOperation[], nonce: string): string {
  const fr = locale === 'fr';
  const href = (language: Locale) => `/docs/${language}/${page.slug}`;
  const guides = (apiGuides: boolean) => chapters(locale).filter(chapter => !chapter.api && ['quickstart', 'model', 'requests'].includes(chapter.slug) === apiGuides).map(chapter => {
    const current = chapter.slug === page.slug;
    return `<a data-page-link href="/docs/${locale}/${chapter.slug}"${current ? ' class="docs-active" aria-current="page"' : ''}>${chapter.title}</a>`;
  }).join('');
  const navigation = resources.filter(([group]) => group !== 'countries').map(([group, french, english]) => {
    const links = operations.filter(item => item.group === group && !item.path.startsWith('/v1/countries')).map(item => {
      const current = `${item.group}/${item.slug}` === page.slug;
      return `<a data-page-link href="${operationAddress(locale, item)}"${current ? ' class="docs-active" aria-current="page"' : ''}><span class="docs-method">GET</span><span>${escapeHtml(item.navigationLabel)}</span></a>`;
    }).join('');
    return links ? `<section class="docs-nav-group"><h2>${fr ? french : english}</h2>${links}</section>` : '';
  }).join('');
  const scalar = page.scalarConfig;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta property="csp-nonce" content="${nonce}"><title>${escapeHtml(page.title)} · 242Places${scalar ? ' API' : ''}</title><link rel="icon" href="/docs/assets/logo.svg">${page.description ? `<meta name="description" content="${escapeHtml(page.description)}">` : ''}<link rel="alternate" hreflang="${fr ? 'en' : 'fr'}" href="${href(fr ? 'en' : 'fr')}"><script data-preferences nonce="${nonce}">${preferenceBootstrap}</script><link rel="stylesheet" href="/docs/assets/shell.css">${scalar ? '<link rel="stylesheet" href="/docs/assets/reference.css">' : ''}</head><body class="dark-mode" data-docs-kind="${scalar ? 'operation' : 'guide'}">
<a class="docs-skip" href="#docs-main">${fr ? 'Aller au contenu' : 'Skip to content'}</a>
<header class="docs-header"><button class="docs-menu" aria-controls="docs-sidebar" aria-expanded="false" aria-label="Navigation">${icon('<path d="M4 6h16M4 12h16M4 18h16"/>')}</button><a class="docs-brand" href="/${locale}" aria-label="242Places${scalar ? ' API' : ''}">${brandMark}<span>Places${scalar ? ' API' : ''}</span></a><nav aria-label="${fr ? 'Langue et thème' : 'Language and theme'}"><a data-locale="fr" href="${href('fr')}" lang="fr"${fr ? ' aria-current="page"' : ''}>FR</a><a data-locale="en" href="${href('en')}" lang="en"${!fr ? ' aria-current="page"' : ''}>EN</a><button class="docs-theme" aria-label="${fr ? 'Thème clair' : 'Light theme'}" aria-pressed="false">${icon('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>')}</button><a class="docs-github" href="https://github.com/Osiris-Balonga/242places" target="_blank" rel="noopener noreferrer" aria-label="${fr ? '242Places sur GitHub (nouvel onglet)' : '242Places on GitHub (new tab)'}" title="GitHub">${icon('<path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.9a3.4 3.4 0 0 0-.9-2.7c3-.3 6.2-1.5 6.2-6.9A5.4 5.4 0 0 0 18.8 5a5 5 0 0 0-.1-3.7S17.5 1 15 2.7a13 13 0 0 0-6 0C6.5 1 5.3 1.3 5.3 1.3A5 5 0 0 0 5.2 5a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.2 6.6 6.2 6.9a3.4 3.4 0 0 0-.9 2.7V22"/>')}<span data-repository-stars hidden aria-hidden="true"></span></a></nav></header>
<div class="docs-layout"><aside id="docs-sidebar" class="docs-sidebar"><div class="docs-filter"><input type="search" data-page-filter aria-label="${fr ? 'Trouver une page' : 'Find a page'}" placeholder="${fr ? 'Trouver une page…' : 'Find a page…'}"></div><nav id="docs-navigation" class="docs-navigation" aria-label="Documentation"><section class="docs-nav-group"><h2>242Places</h2>${guides(false)}</section><section class="docs-nav-group"><h2>${fr ? 'Guides API' : 'API guides'}</h2>${guides(true)}</section>${navigation}<a class="docs-contract" href="/openapi.json">OpenAPI JSON</a></nav><p class="docs-no-results" role="status" hidden>${fr ? 'Aucune page trouvée.' : 'No pages found.'}</p></aside>
<main id="docs-main" tabindex="-1">${page.content}</main></div>
${scalar ? `<script id="reference-config" type="application/json" nonce="${nonce}">${JSON.stringify(scalar).replaceAll('<', '\\u003c')}</script><script src="/docs/js/scalar.js" nonce="${nonce}" defer></script>` : ''}<script src="/docs/assets/shell.js" nonce="${nonce}" defer></script>${scalar ? `<script src="/docs/assets/reference.js" nonce="${nonce}" defer></script>` : ''}</body></html>`;
}
