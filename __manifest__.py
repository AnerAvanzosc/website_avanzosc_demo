{
    "name": "Website Avanzosc Demo",
    "summary": "Tema y contenido a medida para avanzosc.es sobre Odoo 14.",
    "version": "14.0.1.0.0",
    "category": "Website/Theme",
    "website": "https://avanzosc.es",
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
        # Phase 6 — 7 páginas estáticas restantes:
        # 4 corporativas (conocenos, trabaja_con_nosotros, contacto,
        # kit_consulting) + 3 legales (aviso, privacidad, cookies). Las
        # legales llevan marker `LEGAL DRAFT - REVIEW NEEDED BY LEGAL
        # ADVISOR` y bloquean switchover hasta gate Q3. Kit Consulting es
        # ES-only per D5. Slugs EU registrados en eu.po como DRAFT (Q1).
        "views/pages/conocenos.xml",
        "views/pages/trabaja_con_nosotros.xml",
        "views/pages/contacto.xml",
        # Post-v1 sub-bloque B — confirmación tras submit del form /contacto.
        "views/pages/contacto_gracias.xml",
        "views/pages/kit_consulting.xml",
        "views/pages/legal_aviso.xml",
        "views/pages/legal_privacidad.xml",
        "views/pages/legal_cookies.xml",
    ],
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
