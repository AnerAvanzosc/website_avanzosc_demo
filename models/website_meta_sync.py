# -*- coding: utf-8 -*-
"""Sprint B2 — homepage meta translation sync across multi-website copies.

Problema: Odoo crea copias per-website del view `website.homepage`
(master id sin website_id + copias con website_id=1, …). Las copias
NO heredan el xml_id de la master, por lo que las traducciones de
`i18n/eu.po` que apuntan a `model:ir.ui.view,…:website.homepage`
sólo aplican al record master, no a las copias renderizadas.

Resultado del rendering: para una request a `/eu_ES/`, Odoo selecciona
la copia per-website (e.g. id=802) que carece de la entrada eu_ES en
`ir.translation`, y cae al source ES. El title del home aparece igual
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
"""
from odoo import api, models, SUPERUSER_ID


class Website(models.Model):
    _inherit = "website"

    @api.model
    def _avanzosc_sync_homepage_meta(self):
        """Copy `website_meta_title` and `website_meta_description`
        translations from the canonical `website.homepage` view to all
        per-website copies of the same view key.

        Idempotent. Safe to call multiple times.

        Why this is needed: Odoo per-website view duplication doesn't
        carry over `ir.translation` rows. The .po file in this module
        only updates the master record (id with `website.homepage` xml_id),
        not the auto-spawned per-website copies.
        """
        ir_translation = self.env["ir.translation"].sudo()
        ir_view = self.env["ir.ui.view"].sudo()

        # Find master (no website_id) and per-website copies of the home view.
        all_views = ir_view.search([("key", "=", "website.homepage")])
        master = all_views.filtered(lambda v: not v.website_id)
        copies = all_views - master
        if not master or not copies:
            # Nothing to sync (single-website install or no copies yet).
            return

        # For each translatable meta field, copy ir.translation rows from
        # master to each copy.
        meta_fields = ("website_meta_title", "website_meta_description")
        langs = self.env["res.lang"].search([("active", "=", True)]).mapped("code")
        # Skip the source language — it's stored on the field directly,
        # not in ir.translation. Odoo's view propagation handles it.
        non_source_langs = [
            code for code in langs if code != "es_ES"
        ]

        for field_name in meta_fields:
            translation_name = "ir.ui.view,%s" % field_name
            for lang in non_source_langs:
                master_translation = ir_translation.search(
                    [
                        ("name", "=", translation_name),
                        ("res_id", "=", master.id),
                        ("lang", "=", lang),
                    ],
                    limit=1,
                )
                if not master_translation or not master_translation.value:
                    continue
                for copy in copies:
                    existing = ir_translation.search(
                        [
                            ("name", "=", translation_name),
                            ("res_id", "=", copy.id),
                            ("lang", "=", lang),
                        ],
                        limit=1,
                    )
                    if existing:
                        # Already in sync? skip if same value.
                        if existing.value == master_translation.value:
                            continue
                        existing.write(
                            {
                                "value": master_translation.value,
                                "src": master_translation.src,
                                "state": master_translation.state,
                            }
                        )
                    else:
                        ir_translation.create(
                            {
                                "name": translation_name,
                                "lang": lang,
                                "res_id": copy.id,
                                "src": master_translation.src,
                                "value": master_translation.value,
                                "state": master_translation.state,
                                "type": master_translation.type,
                                "module": master_translation.module,
                            }
                        )
