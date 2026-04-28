# -*- coding: utf-8 -*-
"""Module-level install/upgrade hooks for website_avanzosc_demo.

Exposes the wrapper `_post_init_main` invoked from __manifest__.py via
'post_init_hook'. The wrapper composes:
  - post_init_menu_hierarchy (Soluciones dropdown children, D7)
  - post_init_remove_odoo_defaults (cleanup of Odoo default top-level
    menus, D8)

See CLAUDE.md §11 D7 and §11 D8 for the architectural reasons.
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

# Top-level URLs that Odoo seeds per-website by default and that we don't
# want in the new site nav. Cleanup goes via Menu.unlink() cascade (D8).
_ODOO_DEFAULT_MENU_URLS = ("/shop", "/blog", "/slides", "/contactus")


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


def post_init_remove_odoo_defaults(cr, registry):
    """Remove Odoo's per-website default top-level menus (Shop, Blog,
    Courses, Contact us) from each website's nav, while preserving the
    originals in Default Main Menu (which carry core xml_ids and must
    stay installable for the parent modules website_sale / website_slides
    / website to keep working).

    Why this is a Python hook instead of XML data:
        XML data files cannot delete records they don't own (the per-
        website copies have no own xml_id; only the Default Main Menu
        originals do). We therefore use Menu.unlink()'s cascade-by-URL
        mechanic from a Python hook.

    Cascade mechanic (D8):
        addons/website/models/website_menu.py:105-113 — when unlink() is
        called on a menu whose parent is Default Main Menu, the ORM also
        searches for `website.menu` records matching the same URL with
        `website_id != False` and unlinks them too. The originals in
        Default Main Menu have `website_id = False` so they are NEVER
        matched by the cascade — only the per-website copies are.

    Pattern:
        For each URL we want gone, create a dummy under Default Main Menu
        with that URL and immediately unlink it. The cascade then removes
        every per-website copy sharing the URL.

        Note on Menu.create() side-effect: the create() else branch
        (website_menu.py:86-97) spawns one record per website (parent =
        website.menu_id) plus one in Default Main Menu. The unlink()
        cascade then sweeps every website_id != False match — including
        the freshly-spawned per-website copies. End state is the same as
        if no transient copies had been created.

    Idempotency:
        Skip URLs that have no per-website copy left. Safe to re-run from
        an Odoo shell without creating-and-deleting transient records.

    Limitation (CLAUDE.md §11 D8):
        If a future `-u <core_module>` (e.g. `-u website_sale`) runs
        WITHOUT also updating `website_avanzosc_demo`, Odoo's data files
        re-create the website-specific copies of /shop etc. and they
        re-appear. Mitigation: always upgrade `website_avanzosc_demo`
        together with any of {website, website_sale, website_slides}.
    """
    env = api.Environment(cr, SUPERUSER_ID, {})
    Menu = env["website.menu"]
    default_menu = env.ref("website.main_menu", raise_if_not_found=False)
    if not default_menu:
        return

    for url in _ODOO_DEFAULT_MENU_URLS:
        # Idempotency guard: only proceed if a per-website copy still exists.
        existing = Menu.search(
            [("url", "=", url), ("website_id", "!=", False)],
            limit=1,
        )
        if not existing:
            continue
        dummy = Menu.create(
            {
                "name": "_avanzosc_cleanup_%s" % url.lstrip("/"),
                "url": url,
                "parent_id": default_menu.id,
            }
        )
        # Cascade D8: unlink propagates to all per-website copies of `url`.
        dummy.unlink()


def _post_init_main(cr, registry):
    """Wrapper invoked by manifest 'post_init_hook'.

    Composes the two post-init sub-logics in deterministic order:
      1. post_init_menu_hierarchy — Soluciones dropdown children (D7).
      2. post_init_remove_odoo_defaults — cleanup of Odoo defaults (D8).

    Order is independent: Soluciones children live under our own menu;
    cleanup targets unrelated URLs. Either order yields the same end state.
    """
    post_init_menu_hierarchy(cr, registry)
    post_init_remove_odoo_defaults(cr, registry)
