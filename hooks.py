# -*- coding: utf-8 -*-
"""Module-level install/upgrade hooks for website_avanzosc_demo.

Currently provides only `post_init_menu_hierarchy`, invoked from
__manifest__.py via 'post_init_hook'. See CLAUDE.md §11 D7 for the
architectural reason this exists instead of pure XML data.
"""

from odoo import api, SUPERUSER_ID


# Children of the «Soluciones sectoriales» dropdown.
# Format: (name, url, sequence). Order/sequence matches the funnel
# from spec §7 (industrial, distribución, servicios, academias).
_SOLUCIONES_CHILDREN = (
    ("Industrial", "/industrial", 10),
    ("Distribución", "/distribucion", 20),
    ("Servicios", "/servicios", 30),
    ("Academias", "/academias", 40),
)

_SOLUCIONES_NAME = "Soluciones sectoriales"


def post_init_menu_hierarchy(cr, registry):
    """Create the 4 dropdown children of «Soluciones sectoriales» per website.

    Why this is a Python hook instead of XML data:
        Odoo 14 multi-website handling of `website.menu` records flattens
        sub-hierarchies declared in XML. Specifically, addons/website/models/
        website_menu.py:80-99 — Menu.create() else branch forces
        parent_id = website.menu_id.id (top_menu of each website) for
        records without an explicit `website_id` in vals, IGNORING the
        parent_id from vals. Only records whose parent_id equals
        default_menu.id (root) are saved into Default Main Menu. Records
        with parent_id pointing to another menu (e.g. our menu_soluciones)
        are NOT saved into Default Main Menu and the website-specific
        copies end up flat at top_menu.

    Workaround:
        Pass `website_id` explicitly. This makes Menu.create() take the
        first `if 'website_id' in vals` branch, which preserves parent_id
        as given. We look up the per-website Soluciones record and create
        each child under it.

    Idempotency:
        Search for existing children by (name, parent_id, website_id)
        before creating. Re-running -u or this hook does NOT duplicate.

    See also:
        CLAUDE.md §11 D7 — architectural decision.
        data/menu.xml — declares the 7 top-level entries (which DO work
        via XML because their parent_id is `website.main_menu` root).
    """
    env = api.Environment(cr, SUPERUSER_ID, {})
    Menu = env["website.menu"]
    websites = env["website"].search([])

    for website in websites:
        if not website.menu_id:
            # Website has no top_menu yet (shouldn't happen post-bootstrap).
            continue

        soluciones = Menu.search(
            [
                ("name", "=", _SOLUCIONES_NAME),
                ("website_id", "=", website.id),
                ("parent_id", "=", website.menu_id.id),
            ],
            limit=1,
        )
        if not soluciones:
            # Soluciones not yet propagated to this website (race or
            # cleanup left). Skip; next -u will retry.
            continue

        for name, url, sequence in _SOLUCIONES_CHILDREN:
            existing = Menu.search(
                [
                    ("name", "=", name),
                    ("website_id", "=", website.id),
                    ("parent_id", "=", soluciones.id),
                ],
                limit=1,
            )
            if existing:
                continue
            Menu.create(
                {
                    "name": name,
                    "url": url,
                    "parent_id": soluciones.id,
                    "website_id": website.id,
                    "sequence": sequence,
                }
            )
