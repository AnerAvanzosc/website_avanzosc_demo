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
import logging
from datetime import datetime

from markupsafe import escape

from odoo import http
from odoo.http import request
from odoo.addons.website.controllers.main import Website

_logger = logging.getLogger(__name__)


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
        # /trabaja-con-nosotros eliminada post-v1 (sesión 2026-04-30);
        # 301 a /conocenos vía data/redirects.xml. Fuera del sitemap.
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
            # Lang prefix /eu_ES delante del path. Para path raíz '/' la URL
            # canónica EU es `/eu_ES` SIN trailing slash, alineado con el
            # special case de Odoo 14 `_get_canonical_url_localized`
            # (`addons/website/models/website.py:1001-1005`):
            #   if lang_path and path == '/': localized_path = lang_path
            # Si emitimos `/eu_ES/` (con trailing) en el sitemap, Google
            # crawlea esa URL pero `_is_canonical_url` la rechaza por
            # mismatch contra `/eu_ES`, y `_get_alternate_languages`
            # retorna [] → la home EU se sirve sin hreflang. Audit I4
            # 2026-05-04, fix Sprint B4 (D26).
            if path == '/':
                return url_root + '/eu_ES'
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


class WebsiteAvanzoscContact(http.Controller):
    """Form handler for /contacto (post-v1 sub-bloque B).

    Diseño:
      - POST /contacto/submit recibe los 5 campos del form (nombre,
        email, empresa, telefono opcional, mensaje) + checkbox privacidad
        + campo honeypot 'website'.
      - Honeypot: si llega relleno → silencioso 303 a /gracias (sin
        enviar email ni dar pistas al bot).
      - Required server-side: nombre, email, empresa, mensaje, privacidad.
        HTML5 required cubre el 99% en cliente; el server-side es
        defense-in-depth contra clientes sin JS o requests forjados.
        Si falla, redirect a /contacto sin email (sin prefill: el browser
        suele preservar el form via back button).
      - CSRF: csrf=True en el route + token hidden en el form (Odoo
        valida nativamente; rechaza con 400 si missing/inválido).
      - Email vía mail.mail con email_from=email_to=comercial@avanzosc.es,
        reply_to=email del usuario para que «Reply» en Inbox responda al
        usuario directamente. Subject incluye nombre + empresa para
        triage rápido en bandeja.
      - Redirección final con Post-Redirect-Get (303): /contacto/gracias
        en ES, /eu_ES/contacto/gracias en EU. No bloqueante con SMTP no
        configurado (try/except en send): aunque el mail falle internamente,
        UX al usuario es la misma — el log captura el error para post-mortem.

    Sin CRM (rompe Phase 6 C3 conscientemente per briefing post-v1).
    Sin captcha v1.
    """

    @http.route('/contacto/submit', type='http', auth='public',
                methods=['POST'], website=True, csrf=True, sitemap=False)
    def contacto_submit(self, **post):
        # 1. Honeypot — campo trampa 'website' oculto vía CSS y aria-hidden.
        # Bots autollenan campos con name="website"/"url"; humanos no lo ven.
        # Silencioso → bots no aprenden que falló y no reintentan.
        if post.get('website'):
            _logger.info('[contacto] honeypot triggered, silenced')
            return request.redirect(self._gracias_url())

        # 2. Required fields server-side.
        required = ('nombre', 'email', 'empresa', 'mensaje')
        if not all((post.get(f) or '').strip() for f in required):
            return request.redirect(self._contacto_url())
        if not post.get('privacidad'):
            return request.redirect(self._contacto_url())

        # 3. Compose + send email.
        nombre = (post.get('nombre') or '').strip()
        email = (post.get('email') or '').strip()
        empresa = (post.get('empresa') or '').strip()
        telefono = (post.get('telefono') or '').strip()
        mensaje = (post.get('mensaje') or '').strip()
        lang_code = request.lang.code if request.lang else 'es_ES'

        body_html = self._format_body(nombre, email, empresa, telefono, mensaje, lang_code)
        subject = u'[Web] Consulta de %s – %s' % (nombre, empresa)

        try:
            mail = request.env['mail.mail'].sudo().create({
                'subject': subject,
                'body_html': body_html,
                'email_to': 'comercial@avanzosc.es',
                'email_from': 'comercial@avanzosc.es',
                'reply_to': email,
            })
            mail.send()
        except Exception:
            _logger.exception('[contacto] mail.mail send failed (form submission still confirmed to user)')

        return request.redirect(self._gracias_url())

    def _contacto_url(self):
        if request.lang and request.lang.code != 'es_ES':
            return '/' + request.lang.url_code + '/contacto'
        return '/contacto'

    def _gracias_url(self):
        if request.lang and request.lang.code != 'es_ES':
            return '/' + request.lang.url_code + '/contacto/gracias'
        return '/contacto/gracias'

    def _format_body(self, nombre, email, empresa, telefono, mensaje, lang_code):
        """HTML body de la notificación interna a comercial@.

        markupsafe.escape evita inyección HTML desde inputs del usuario
        (XSS sobre el cliente de mail si el atacante escribe <script> en
        cualquier campo). El body se monta a partir de strings escapados
        + tags fijos del template.
        """
        telefono_display = escape(telefono) if telefono else u'<em>(no facilitado)</em>'
        return (
            u'<p><strong>Nombre:</strong> %s</p>'
            u'<p><strong>Email:</strong> %s</p>'
            u'<p><strong>Empresa:</strong> %s</p>'
            u'<p><strong>Teléfono:</strong> %s</p>'
            u'<p><strong>Idioma:</strong> %s</p>'
            u'<p><strong>Recibido:</strong> %s UTC</p>'
            u'<hr/>'
            u'<p><strong>Mensaje:</strong></p>'
            u'<pre style="white-space: pre-wrap; font-family: inherit;">%s</pre>'
        ) % (
            escape(nombre),
            escape(email),
            escape(empresa),
            telefono_display,
            escape(lang_code),
            escape(datetime.utcnow().isoformat(timespec='seconds')),
            escape(mensaje),
        )


class WebsiteAvanzoscBlogRedirect(http.Controller):
    """Q5 — Legacy /blog/* → home redirect (post-v1 sesión 2026-04-30).

    El sitio legacy avanzosc.es tiene un blog activo (16+ URLs `/blog*`
    en sitemap.xml verificado: `/blog`, `/blog/odoo-1`, `/blog/odoo-1/<slug>`).
    Decisión D11 «Blog» (CLAUDE.md §11): blog FUERA del sitio v1. Para
    preservar enlaces externos y SEO acumulado, todas las URLs `/blog*`
    redirigen 301 a la home (lang-preserved).

    Por qué controller HTTP y no `website.rewrite`:
      - `website.rewrite` con `redirect_type=301` solo soporta MATCH LITERAL
        de `url_from` (verificado en `addons/website/models/ir_http.py`
        `_serve_redirect`). No hay sintaxis wildcard nativa para 301.
      - `redirect_type=308` SÍ soporta `<path:rest>` werkzeug, pero genera
        308 status code (no 301). El briefing Q5 exige 301 puro para
        coherencia SEO con el resto de redirects del módulo.
      - Listar 16 entries individuales sería frágil (cualquier URL legacy
        no listada hoy daría 404 mañana). Wildcard via controller cubre
        cualquier URL `/blog/...` futura.

    Lang-aware: ES request redirige a `/`, EU request a `/eu_ES/`. Patrón
    D18 (CLAUDE.md §11): `request.lang.code` decide el prefijo del
    redirect target.
    """

    def _home_url(self):
        if request.lang and request.lang.code != 'es_ES':
            return '/' + request.lang.url_code + '/'
        return '/'

    @http.route(['/blog', '/blog/<path:rest>'], type='http', auth='public',
                website=True, sitemap=False, csrf=False)
    def blog_legacy_redirect(self, rest=None, **kwargs):
        """Captura /blog (raw) y /blog/foo/bar/baz (wildcard via path:rest).
        En ambos casos 301 a la home lang-correspondiente.

        Trailing slash (/blog/ → /blog) lo gestiona Odoo automáticamente
        antes de despachar a este controller per `_match_request`.
        """
        return request.redirect(self._home_url(), code=301)
