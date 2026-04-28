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
    ],
    "installable": True,
    "application": False,
    # Post-init hook to create the 4 dropdown children of «Soluciones
    # sectoriales» per website. Necessary because Odoo 14 multi-website
    # flattens menu hierarchies declared in XML data — see hooks.py and
    # CLAUDE.md §11 D7 for the architectural reason.
    "post_init_hook": "post_init_menu_hierarchy",
}
