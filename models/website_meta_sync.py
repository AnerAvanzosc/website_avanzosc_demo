# -*- coding: utf-8 -*-
"""Sprint B2 — homepage meta translation sync across multi-website copies.

Problema: Odoo crea copias per-website del view `website.homepage`
(master id sin website_id + copias con website_id=1, …). Las copias
NO heredan el xml_id de la master, por lo que las traducciones de
`i18n/eu.po` que apuntan a `model:ir.ui.view,…:website.homepage`
sólo aplican al record master, no a las copias renderizadas.

Resultado del rendering: para una request a `/eu_ES/`, Odoo selecciona
la copia per-website (e.g. id=802) que en el JSONB de `website_meta_*`
carece del slot `eu_ES` y cae al source. El title del home aparece igual
en ambos idiomas (audit I5 partialmente cerrado para el resto de
sectoriales+contacto pero NO para home).

Solución: este model añade el método `_avanzosc_sync_homepage_meta`
que copia las traducciones EU del master a TODAS las copias del view
con la misma `key`. Idempotente. Se invoca:
  - via `<function>` en `data/website_meta.xml` (corre en cada `-i`/`-u`).
  - via `_post_init_main` en `hooks.py` para garantizar el primer install.

NO inventamos los strings aquí: leemos el valor del master que ya tiene
la traducción cargada por Odoo desde `i18n/eu.po`. Si el master no
tiene el valor, no se hace nada (defensivo).

v18: traducciones persisten como columnas JSONB en cada modelo (no en
`ir.translation`, modelo eliminado en v17+). Lectura per-lang vía
`record.with_context(lang=<code>)[field]`; escritura simétrica vía
`record.with_context(lang=<code>).write({field: value})` — Odoo
gestiona internamente el merge JSONB. Ver D27+ y CLAUDE.md §3.
"""
import base64

from odoo import api, models, tools


class Website(models.Model):
    _inherit = "website"

    # Brand assets (A2/A3, lote 3 2026-06-15). Logo del header (website.logo)
    # + footer (res.company.logo, ver views/layout.xml:185) + imagen social
    # por defecto (website.social_default_image → og:image/twitter:image vía
    # el mixin SEO, mixins.py:50 v18: usa social_default_image cuando
    # has_social_default_image). Ficheros en static/src/img/. El SVG
    # (avanzosc_logo.svg) se aloja como alternativa vectorial para escalado
    # pero NO se usa por defecto: pesa ~80KB con degradado vs ~105KB del PNG
    # a tamaño fijo, y el header lo sirve a 30px de alto donde el PNG basta.
    _AVANZOSC_LOGO_PATH = "website_avanzosc_demo/static/src/img/avanzosc_logo.png"
    _AVANZOSC_OG_PATH = "website_avanzosc_demo/static/src/img/og-image.jpg"

    @api.model
    def _avanzosc_set_brand_assets(self):
        """Set the real brand logo (header + footer) and the default social
        share image from the module's static files.

        Idempotent: reads each file once and writes a binary field only when
        it differs from the asset's current bytes (avoids rewriting binaries
        — and invalidating derived/cached images — on every -u). Reproducible
        on a fresh install: invoked from data/website_meta.xml <function>,
        which runs on both -i and -u (unlike the homepage-meta sync, this
        does not depend on .po being loaded, so no post-init hook call is
        needed). Resolves A2 (placeholder logo) and A3 (og:image was the SVG
        logo, unrenderable by social crawlers).
        """
        def _read(path):
            with tools.file_open(path, "rb") as fh:
                return base64.b64encode(fh.read())

        logo_b64 = _read(self._AVANZOSC_LOGO_PATH)
        og_b64 = _read(self._AVANZOSC_OG_PATH)

        # website 1: header logo + default social image.
        website = self.env["website"].browse(1).sudo()
        if website.exists():
            vals = {}
            if website.logo != logo_b64:
                vals["logo"] = logo_b64
            if website.social_default_image != og_b64:
                vals["social_default_image"] = og_b64
            if vals:
                website.write(vals)

        # res.company 1: footer logo (t-field res_company.logo).
        company = self.env["res.company"].browse(1).sudo()
        if company.exists() and company.logo != logo_b64:
            company.write({"logo": logo_b64})

    @api.model
    def _avanzosc_sync_homepage_meta(self):
        """Copy `website_meta_title` and `website_meta_description`
        translations from the canonical `website.homepage` view to all
        per-website copies of the same view key.

        Idempotent. Safe to call multiple times.

        Why this is needed: Odoo per-website view duplication doesn't
        propagate the JSONB translation slots of the duplicated view's
        translatable fields. The .po file in this module only updates
        the master record (id with `website.homepage` xml_id), not the
        auto-spawned per-website copies.
        """
        ir_view = self.env["ir.ui.view"].sudo()
        all_views = ir_view.search([("key", "=", "website.homepage")])
        master = all_views.filtered(lambda v: not v.website_id)
        copies = all_views - master
        if not master or not copies:
            # Nothing to sync (single-website install or no copies yet).
            return

        meta_fields = ("website_meta_title", "website_meta_description")
        source_lang = "es_ES"
        # `get_installed()` returns [(code, name), ...] for active langs only.
        # Skip the source lang (master writes it directly to the JSONB source slot).
        non_source_langs = [
            code for code, _name in self.env["res.lang"].get_installed()
            if code != source_lang
        ]

        for field_name in meta_fields:
            for lang in non_source_langs:
                master_value = master.with_context(lang=lang)[field_name]
                if not master_value:
                    # Defensive: master has no translation for this lang.
                    continue
                for copy in copies:
                    copy_in_lang = copy.with_context(lang=lang)
                    if copy_in_lang[field_name] == master_value:
                        # Already in sync.
                        continue
                    copy_in_lang.write({field_name: master_value})
