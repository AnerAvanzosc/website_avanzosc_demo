# -*- coding: utf-8 -*-
"""Redirects 301 lang-aware que `website.rewrite` no puede expresar en v18.

Por qué `website.rewrite` no sirve aquí (verificado empíricamente
2026-06-11 contra source v18):

  - El router multilang (caso /9, addons/http_routing/models/ir_http.py:473-478)
    hace `request.reroute(path_no_lang)` ANTES del route matching: una
    request a `/eu_ES/X` llega a todo el pipeline posterior con
    `request.httprequest.path = '/X'` y `request.lang = eu_ES`. Un
    `url_from` con prefijo `/eu_ES/...` no matchea nunca, y el record ES
    sin prefijo captura ambos idiomas perdiendo el lang en el destino.
  - `_serve_redirect` solo se consulta en `_serve_fallback` (404 del
    router, addons/website/models/ir_http.py:378), así que una URL que
    resuelve a página válida (p.ej. `/eu_ES/kit-consulting` sirviendo la
    website.page `/kit-consulting` en eu) jamás dispara un rewrite.

`_serve_fallback` es el punto donde ambas piezas son visibles a la vez
(path rerouteado + request.lang), y ambos casos de abajo caen en él
porque ninguno tiene controller route propio.

Caso 1 — M9 (auditoría 2026-06-11, D5): `/eu_ES/kit-consulting` → 301
`/kit-consulting`. El programa Kit Consulting es ES-only (D5): la URL EU
servía 200 con contenido castellano, canonical EU propio y hreflang eu,
contradiciendo el sitemap (que correctamente la excluye). El 301 lleva
`Set-Cookie: frontend_lang=es_ES` — sin él, un visitante con cookie
eu_ES entra en loop infinito: GET `/kit-consulting` sin prefijo + cookie
eu → caso /5 del router redirige a `/eu_ES/kit-consulting` → nuestro 301
→ ... El patrón cookie-en-redirect es el mismo que usa el core en el
caso /6 (strip de default lang). Trade-off asumido (decisión orquestador
lote 1): el visitante EU que entra a kit-consulting pasa a navegar en ES.
"""

from odoo import models
from odoo.http import request


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    @classmethod
    def _serve_fallback(cls):
        path = request.httprequest.path
        lang = getattr(request, "lang", None)
        if lang is not None and lang.code == "eu_ES":
            if path == "/kit-consulting":
                redirect = request.redirect("/kit-consulting", code=301, local=True)
                # Evita el loop con el caso /5 del router (ver docstring).
                redirect.set_cookie("frontend_lang", "es_ES")
                return redirect
        return super()._serve_fallback()
