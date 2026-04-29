# -*- coding: utf-8 -*-
"""
Controller overrides — Phase 10.1 + 10.2.

`/sitemap.xml` y `/robots.txt` son override del built-in de Odoo
`addons/website/controllers/main.py`. Razones del override:

- **Sitemap**: el built-in enumera todos los `website.page` activos +
  rutas de `website_sale`, `website_slides`, `website_blog`, etc. En
  v1 queremos sitemap limpio con SOLO las 12 ES + 11 EU URLs canónicas
  del módulo (sin /shop, /slides, /blog, /profile, /web/login, etc.).
  Indexar URLs irrelevantes para SEO daña el ranking del subset
  realmente útil.

- **Robots.txt**: el built-in lee `website.robots_txt` field (Settings
  → Website). Decisión Phase 10.2: durante QA en `nueva.avanzosc.es`
  servir `Disallow: /` con marker explícito de switchover. El controller
  custom hace este texto deterministic, no editable desde UI por error.

Domain dinámico: `request.httprequest.url_root` se evalúa por request.
Cuando el dev sirve en `localhost:14070`, sitemap muestra localhost.
Cuando producción sirva en `nueva.avanzosc.es` o `avanzosc.es` post-
switchover, el sitemap se auto-actualiza sin requerir commit/redeploy.
Decisión sesión 2026-04-29 Phase 10.1: dynamic > hardcoded para
robustez al switchover (un TODO menos en el runbook).

hreflang alternates: cada URL ES declara su equivalente EU (excepto
/kit-consulting per D5 ES-only). Los rel=alternate hreflang permiten
a Google entender que son la misma página en idiomas distintos sin
penalizar como duplicate content.
"""
from odoo import http
from odoo.http import request
from odoo.addons.website.controllers.main import Website


class WebsiteAvanzoscSitemap(Website):

    # ---- Páginas canónicas v1 ----
    # Path-only (sin lang prefix). Marca booleana `eu` = True si la página
    # tiene equivalente EU. Kit Consulting es ES-only per D5.
    _CANONICAL_PAGES = [
        {'path': '/', 'eu': True},
        {'path': '/industrial', 'eu': True},
        {'path': '/distribucion', 'eu': True},
        {'path': '/servicios', 'eu': True},
        {'path': '/academias', 'eu': True},
        {'path': '/conocenos', 'eu': True},
        {'path': '/trabaja-con-nosotros', 'eu': True},
        {'path': '/contacto', 'eu': True},
        {'path': '/kit-consulting', 'eu': False},  # D5 — ES-only
        {'path': '/aviso-legal', 'eu': True},
        {'path': '/politica-privacidad', 'eu': True},
        {'path': '/politica-cookies', 'eu': True},
    ]

    @http.route('/sitemap.xml', type='http', auth='public', website=True,
                multilang=False, sitemap=False)
    def sitemap_xml_index(self, **kwargs):
        """Override built-in sitemap. Devuelve XML con las 12 ES + 11 EU
        URLs canónicas del módulo + hreflang alternates por URL.

        Validable contra schema sitemaps.org Sitemap Protocol 0.9.
        """
        # url_root incluye trailing slash (e.g. 'http://localhost:14070/').
        url_root = request.httprequest.url_root.rstrip('/')

        def es_url(path):
            # path ya empieza con '/', e.g. '/industrial'. '/' raíz es el caso
            # especial — concatenado da 'http://host' (sin trailing slash).
            return url_root + path if path != '/' else url_root + '/'

        def eu_url(path):
            # Lang prefix /eu_ES/ delante del path. Path '/' → '/eu_ES/'.
            if path == '/':
                return url_root + '/eu_ES/'
            return url_root + '/eu_ES' + path

        urls_xml = []
        for page in self._CANONICAL_PAGES:
            es = es_url(page['path'])
            urls_xml.append(self._build_url_entry(es, eu_url(page['path']) if page['eu'] else None, lang='es'))
            if page['eu']:
                urls_xml.append(self._build_url_entry(eu_url(page['path']), es, lang='eu'))

        body = (
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
            '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + ''.join(urls_xml)
            + '</urlset>\n'
        )
        return request.make_response(body, headers=[('Content-Type', 'application/xml; charset=utf-8')])

    def _build_url_entry(self, loc, alternate, lang):
        """Build a single <url> element with hreflang alternates.

        Si la página tiene un alternate, declaramos los DOS hreflang
        (self-reference + alternate) per Google's recommendation:
        each language version should declare ALL alternates including
        itself. Si NO hay alternate (e.g. kit-consulting ES-only),
        omitimos el bloque hreflang completo.
        """
        if alternate:
            es_loc = loc if lang == 'es' else alternate
            eu_loc = alternate if lang == 'es' else loc
            hreflang = (
                '        <xhtml:link rel="alternate" hreflang="es" href="' + es_loc + '"/>\n'
                '        <xhtml:link rel="alternate" hreflang="eu" href="' + eu_loc + '"/>\n'
                '        <xhtml:link rel="alternate" hreflang="x-default" href="' + es_loc + '"/>\n'
            )
        else:
            hreflang = ''
        return (
            '    <url>\n'
            '        <loc>' + loc + '</loc>\n'
            + hreflang
            + '    </url>\n'
        )

    @http.route('/robots.txt', type='http', auth='public', website=True,
                sitemap=False)
    def robots(self, **kwargs):
        """Override built-in robots. Durante QA en `nueva.avanzosc.es`
        servimos `Disallow: /` para evitar que Google indexe el subdominio
        de pre-producción (Phase 10.2 + spec §12.1, D6).

        ANTES del switchover (Phase 10.5/10.6 del runbook): cambiar
        `Disallow: /` a `Allow: /` o eliminar el bloque restrictivo.
        Verificable con curl post-DNS.

        Sitemap line apunta al dominio current vía `request.httprequest.url_root`
        — auto-adaptable al switchover sin redeploy.
        """
        url_root = request.httprequest.url_root.rstrip('/')
        body = (
            '# robots.txt — website_avanzosc_demo\n'
            '# Phase 10.2 — controlled by `controllers/main.py:robots_txt`.\n'
            '#\n'
            '# *** DURANTE QA EN nueva.avanzosc.es: Disallow total para evitar indexación. ***\n'
            '# *** ANTES DEL SWITCHOVER (Phase 10.5/10.6): cambiar a Allow: / y verificar. ***\n'
            '#\n'
            'User-agent: *\n'
            'Disallow: /\n'
            '\n'
            'Sitemap: ' + url_root + '/sitemap.xml\n'
        )
        return request.make_response(body, headers=[('Content-Type', 'text/plain; charset=utf-8')])
