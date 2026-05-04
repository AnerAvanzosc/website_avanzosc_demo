# -*- coding: utf-8 -*-
"""I4 (D26) — Redirect `/eu_ES/` (trailing slash) → `/eu_ES`.

Why this lives in `ir.http._dispatch` and NOT in a controller:

`@http.route('/eu_ES/')` no funciona porque Werkzeug routing en Odoo 14
usa `strict_slashes=False` (`base/odoo/http.py:1328`), lo que hace que
una ruta declarada como `/eu_ES/` matchee TAMBIÉN `/eu_ES`. Resultado:
controller intercepta el destino del 301 y entra en loop self-redirect
(verificado empíricamente sesión 2026-05-04: `curl /eu_ES` retornaba
301 con Location=`/eu_ES`).

Tampoco funciona `website.rewrite` con `url_from='/eu_ES/'`: Werkzeug
matchea la ruta válida core `Home.index` (multilang) antes de entrar
en `_serve_redirect` (verificado: record cargado en BD pero `curl -I
/eu_ES/` retornaba 200 directo).

`ir.http._dispatch` corre ANTES de Werkzeug routing matching, con
`request.httprequest.path` raw del cliente. Inspecting el path literal
distinguimos `/eu_ES/` de `/eu_ES` sin colisión.

Causa raíz del bug original (audit I4 2026-05-04):
  `_get_canonical_url_localized` en `addons/website/models/website.py:1001-1005`
  hace special case: si `lang_path and path == '/'`, devuelve `lang_path`
  SIN concatenar `path='/'`. La canonical de EU home queda `/eu_ES` sin
  trailing. Requests con `/eu_ES/` (trailing) fallan `_is_canonical_url`
  → `_get_alternate_languages` retorna [] → la home EU se sirve sin
  `<link rel="alternate" hreflang>` en `<head>` → señal multilingüe
  perdida en SERP de Google.

Combined con Sprint B4 Fix 1 (controllers/main.py:81-95) que emite la URL
canonical sin trailing en el sitemap, este redirect cubre la ruta de
hits desde fuentes externas (clic en language switcher Odoo core,
bookmarks legacy, sitemaps externos a avanzosc.es).

Query strings preservados via `request.httprequest.query_string`.
"""
from werkzeug.utils import redirect as werkzeug_redirect

from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    @classmethod
    def _dispatch(cls):
        # Pre-routing intercept of the EU-home trailing-slash variant.
        # Compares against the raw client-sent path so Werkzeug's
        # strict_slashes=False normalization doesn't blur the distinction.
        # We use `werkzeug.utils.redirect` (no `request.redirect`) because
        # at `_dispatch` time `request` is the bare `HttpRequest` and the
        # `.redirect()` method (added by Odoo's WebRequest wrapper) is not
        # yet bound — verified empíricamente sesión 2026-05-04: usar
        # `request.redirect()` aquí lanzaba AttributeError.
        if request and request.httprequest.path == "/eu_ES/":
            qs = request.httprequest.query_string.decode("utf-8")
            target = "/eu_ES" + (("?" + qs) if qs else "")
            return werkzeug_redirect(target, code=301)
        return super(IrHttp, cls)._dispatch()
