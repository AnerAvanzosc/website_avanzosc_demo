{
    "name": "Website Avanzosc Demo",
    "summary": "Tema y contenido a medida para avanzosc.es sobre Odoo 14.",
    "version": "18.0.1.0.0",
    "category": "Website/Theme",
    "website": "https://github.com/avanzosc/odoo-addons",
    "author": "Avanzosc S.L.",
    "license": "AGPL-3",
    "depends": [
        "website",
        "website_sale",
        "website_slides",
    ],
    # Note: `i18n/*.po` files are NOT listed here — Odoo auto-loads them
    # from the module's `i18n/` directory on -i / -u (per OCA + core
    # convention). `eu.po` lives there for Basque translations (Task 1.4).
    "data": [
        "views/assets.xml",
        "data/menu.xml",
        "data/redirects.xml",
        # Cleanup declarativo de records orfanos tras eliminar
        # /trabaja-con-nosotros (post-v1 sesión 2026-04-30). Idempotente.
        "data/cleanup_empleo_removal.xml",
        "views/layout.xml",
        # Phase 3 — snippets (Tasks 3.1-3.10). Each snippet is a QWeb
        # template invoked via `t-call` from `views/test_snippets.xml`
        # (the QA progressive page) or future `views/pages/*.xml`.
        "views/snippets/pilares.xml",
        "views/snippets/sectores_grid.xml",
        "views/snippets/cta_kit_consulting.xml",
        "views/snippets/cta_contacto.xml",
        "views/snippets/contador_modulos.xml",
        "views/snippets/caso_exito.xml",
        "views/snippets/sector_specifics.xml",
        "views/snippets/timeline_trayectoria.xml",
        "views/snippets/equipo.xml",
        "views/snippets/hero.xml",
        "data/config_parameters.xml",
        # Phase 4 — composición de la home / con los 9 snippets en orden
        # funnel. La view extiende `website.homepage` via xpath
        # inheritance.
        "views/pages/home.xml",
        # Phase 5 — 4 páginas sectoriales con copy específico, archetype
        # destacado y sector_specifics filtrado. Cada una hereda directamente
        # de `website.layout` (no extiende otra view) y crea un `website.page`
        # record propio. URLs ES + EU translatable per spec D2.
        "views/pages/industrial.xml",
        "views/pages/distribucion.xml",
        "views/pages/servicios.xml",
        "views/pages/academias.xml",
        # Phase 6 — 6 páginas estáticas restantes:
        # 3 corporativas (conocenos, contacto, kit_consulting) + 3 legales
        # (aviso, privacidad, cookies). Las legales llevan marker
        # `LEGAL DRAFT - REVIEW NEEDED BY LEGAL ADVISOR` y bloquean
        # switchover hasta gate Q3. Kit Consulting es ES-only per D5.
        # Slugs EU registrados en eu.po como DRAFT (Q1).
        # Nota: /trabaja-con-nosotros eliminada post-v1 (sesión
        # 2026-04-30); URL redirige 301 a /conocenos vía data/redirects.xml.
        "views/pages/conocenos.xml",
        "views/pages/contacto.xml",
        # Post-v1 sub-bloque B — confirmación tras submit del form /contacto.
        "views/pages/contacto_gracias.xml",
        "views/pages/kit_consulting.xml",
        "views/pages/legal_aviso.xml",
        "views/pages/legal_privacidad.xml",
        "views/pages/legal_cookies.xml",
        # Sprint B2 metadata bundle (a11y/SEO audit 2026-05-04). Site
        # name + per-page website_meta_title + website_meta_description.
        # Cierra C2 + I1 + I5 + I7 + I8 (og/twitter rendering automático
        # por core desde estos campos). EU translations en i18n/eu.po
        # como DRAFT pendientes de Q1 fase 2.
        # Carga al final: depende de los page records definidos en
        # views/pages/*.xml + del record website.homepage_page (core).
        "data/website_meta.xml",
    ],
    # Phase 1 v18 migration — assets registered via manifest dict (v15+
    # pattern). Mirrors exactly the load order of the legacy
    # `<template inherit_id="web.assets_frontend">` xpath in
    # views/assets.xml (kept in place transitionally as dead code; the
    # v18 bundler ignores re-registration of the same paths). Two
    # `inherit_id="web.layout"` templates in that same file
    # (head_external_assets, head_plausible) inject <link>/<script>
    # directly into <head> and are NOT bundle registrations, so they
    # stay in XML as-is.
    #
    # Order rules:
    #   - SCSS: partials de variables/mixins/typography → snippets en
    #     orden de implementación → main.scss al final para que pueda
    #     sobrescribir.
    #   - JS: main.js → utils (count_up, hover_orchestrator) ANTES de
    #     sus consumidores (contador, caso_exito, equipo) → snippets.
    "assets": {
        "web.assets_frontend": [
            # SCSS — base
            "website_avanzosc_demo/static/src/scss/_variables.scss",
            "website_avanzosc_demo/static/src/scss/_mixins.scss",
            "website_avanzosc_demo/static/src/scss/_typography.scss",
            # SCSS — header / footer
            "website_avanzosc_demo/static/src/scss/snippets/_header.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_footer.scss",
            # SCSS — snippets Phase 3
            "website_avanzosc_demo/static/src/scss/snippets/_pilares.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_sectores.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_cta_kit_consulting.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_cta_contacto.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_contador.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_caso_exito.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_sector_specifics.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_timeline.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_equipo.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_hero.scss",
            # SCSS — post-v1
            "website_avanzosc_demo/static/src/scss/snippets/_page_transition.scss",
            "website_avanzosc_demo/static/src/scss/snippets/_contacto.scss",
            # SCSS — main (último para overrides globales)
            "website_avanzosc_demo/static/src/scss/main.scss",
            # JS — entry
            "website_avanzosc_demo/static/src/js/main.js",
            # JS — snippets early
            "website_avanzosc_demo/static/src/js/snippets/pilares.js",
            "website_avanzosc_demo/static/src/js/snippets/reveal.js",
            # JS — utils compartidas (deben cargar ANTES de sus consumers)
            "website_avanzosc_demo/static/src/js/utils/count_up.js",
            "website_avanzosc_demo/static/src/js/utils/hover_orchestrator.js",
            # JS — snippets que consumen utils
            "website_avanzosc_demo/static/src/js/snippets/contador.js",
            "website_avanzosc_demo/static/src/js/snippets/caso_exito.js",
            "website_avanzosc_demo/static/src/js/snippets/equipo.js",
            # JS — resto
            "website_avanzosc_demo/static/src/js/snippets/sectores.js",
            "website_avanzosc_demo/static/src/js/snippets/timeline.js",
            "website_avanzosc_demo/static/src/js/snippets/hero.js",
            "website_avanzosc_demo/static/src/js/snippets/header.js",
            "website_avanzosc_demo/static/src/js/snippets/contacto.js",
        ],
    },
    "installable": True,
    "application": False,
    # Post-init wrapper that composes:
    #   - post_init_setup_languages: activate ES + EU langs and bind
    #     them to website 1 with ES as default (CLAUDE.md §11 D10).
    #   - post_init_menu_hierarchy: 4 dropdown children of «Soluciones»
    #     per website (CLAUDE.md §11 D7).
    #   - post_init_remove_odoo_defaults: cleanup of Odoo's default
    #     per-website top-level menus (Shop, Blog, Courses, Contact us)
    #     via Menu.unlink() cascade (CLAUDE.md §11 D8).
    # All three live in hooks.py.
    "post_init_hook": "_post_init_main",
}
