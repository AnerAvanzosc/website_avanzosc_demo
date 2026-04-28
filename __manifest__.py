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
    "data": [
        "views/assets.xml",
        "data/menu.xml",
        "views/layout.xml",
    ],
    "installable": True,
    "application": False,
    # Post-init wrapper that composes:
    #   - post_init_menu_hierarchy: 4 dropdown children of «Soluciones
    #     sectoriales» per website (CLAUDE.md §11 D7).
    #   - post_init_remove_odoo_defaults: cleanup of Odoo's default
    #     per-website top-level menus (Shop, Blog, Courses, Contact us)
    #     via Menu.unlink() cascade (CLAUDE.md §11 D8).
    # Both live in hooks.py.
    "post_init_hook": "_post_init_main",
}
