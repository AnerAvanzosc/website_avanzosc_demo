# -*- coding: utf-8 -*-
"""Module-level install/upgrade hooks for website_avanzosc_demo.

Exposes the wrapper `_post_init_main` invoked from __manifest__.py via
'post_init_hook'. The wrapper composes:
  - post_init_setup_languages (activate ES + EU, bind to website 1, D10)
  - post_init_menu_hierarchy (Soluciones dropdown children, D7)
  - post_init_remove_odoo_defaults (cleanup of Odoo default top-level
    menus, D8)

See CLAUDE.md §11 D7, D8, D10 for the architectural reasons.
"""

from odoo import api, SUPERUSER_ID


# Children of the «Soluciones sectoriales» dropdown.
# Format: (name, url, sequence, xml_id_name).
#   - name, url, sequence: passed to Menu.create() vals.
#   - xml_id_name: used to register a website_avanzosc_demo.<xml_id_name>
#     ir.model.data entry pointing to the per-website menu record. Required
#     so the .po file can target these records via
#     `#: model:website.menu,name:website_avanzosc_demo.menu_<sector>`
#     and apply EU translations to the dropdown children. Without an
#     xml_id the records are unreachable from declarative translation files.
# Order/sequence matches the funnel from spec §7.
_SOLUCIONES_CHILDREN = (
    ("Industrial", "/industrial", 10, "menu_industrial"),
    ("Distribución", "/distribucion", 20, "menu_distribucion"),
    ("Servicios", "/servicios", 30, "menu_servicios"),
    ("Academias", "/academias", 40, "menu_academias"),
)

# Resolved dynamically at hook time via env.ref('website_avanzosc_demo.menu_soluciones')
# instead of a hardcoded name constant. Rationale: Task 1.4 renamed the
# parent menu from «Soluciones sectoriales» to «Soluciones» in data/menu.xml;
# a hardcoded constant in this file would silently skip the children
# processing loop (the search-by-name returned empty against the old value).
# Reading the name from the canonical record is robust against future
# renames — the xml_id is stable, the name is not.

# Top-level URLs that Odoo seeds per-website by default and that we don't
# want in the new site nav. Cleanup goes via Menu.unlink() cascade (D8).
_ODOO_DEFAULT_MENU_URLS = ("/shop", "/blog", "/slides", "/contactus")

# Languages required by the website per spec D1 (ES + EU). The language
# setup hook ensures both are activated and bound to website 1 with
# es_ES as default. See CLAUDE.md §11 D10.
_REQUIRED_LANG_CODES = ("es_ES", "eu_ES")
_DEFAULT_LANG_CODE = "es_ES"


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

    # Read the canonical Soluciones record by xml_id, stable across renames.
    # The per-website copies share the same `name` value as the canonical
    # one (Odoo's Menu.create() else branch propagates name when spawning
    # per-website siblings).
    soluciones_canonical = env.ref(
        "website_avanzosc_demo.menu_soluciones",
        raise_if_not_found=False,
    )
    if not soluciones_canonical:
        # data/menu.xml hasn't loaded yet, or the record was unlinked
        # outside our flow. Bail out cleanly.
        return

    for website in websites:
        if not website.menu_id:
            # Website has no top_menu yet (shouldn't happen post-bootstrap).
            continue

        soluciones = Menu.search(
            [
                ("name", "=", soluciones_canonical.name),
                ("website_id", "=", website.id),
                ("parent_id", "=", website.menu_id.id),
            ],
            limit=1,
        )
        if not soluciones:
            # Soluciones not yet propagated to this website (race or
            # cleanup left). Skip; next -u will retry.
            continue

        for name, url, sequence, xml_id_name in _SOLUCIONES_CHILDREN:
            existing = Menu.search(
                [
                    ("name", "=", name),
                    ("website_id", "=", website.id),
                    ("parent_id", "=", soluciones.id),
                ],
                limit=1,
            )
            if existing:
                # Idempotent: ensure xml_id exists for already-created child
                # (covers the retroactive case where children were created
                # in a prior session before this xml_id-registration step
                # was added). See _ensure_xml_id_for_menu docstring for why.
                _ensure_xml_id_for_menu(env, existing, xml_id_name)
                continue
            child = Menu.create(
                {
                    "name": name,
                    "url": url,
                    "parent_id": soluciones.id,
                    "website_id": website.id,
                    "sequence": sequence,
                }
            )
            _ensure_xml_id_for_menu(env, child, xml_id_name)


def _ensure_xml_id_for_menu(env, record, xml_id_name):
    """Idempotent helper: register an ir.model.data entry pointing to
    `record` with xml_id `website_avanzosc_demo.<xml_id_name>` if one
    doesn't already exist.

    Why: dropdown children of «Soluciones» are created imperatively by
    post_init_menu_hierarchy (D7) without their own xml_ids — and so
    they cannot be referenced from `i18n/eu.po` with a
    `#: model:website.menu,name:website_avanzosc_demo.menu_industrial`
    annotation. Registering an explicit xml_id post-create makes them
    reachable from .po files (and from any other XML data file in the
    future, e.g. for redirects or page-link references).

    Idempotency:
        Search by (module, name) before create. If the record already
        exists in `ir.model.data`, leave it alone — even if it points
        to a different `res_id` (shouldn't happen in v1 with a single
        website, but defensive). Re-runs are safe.

    `noupdate=True` on the ir.model.data entry: prevents Odoo's data
    loader from trying to update or delete the entry on subsequent
    `-u`. The xml_id we register is essentially permanent — the
    associated record exists, so the entry is just a name binding.

    Multi-website limitation:
        Each website would have its own per-website copy of «Industrial»
        etc. (post_init_menu_hierarchy iterates over all websites). Only
        the FIRST website's copy gets the xml_id under our naming scheme
        (e.g., `menu_industrial`). Subsequent websites' copies remain
        without xml_id. Acceptable for v1 (single website per spec D1).
        If multi-website returns in scope, revisit this scheme — possible
        approach: append website slug to xml_id (`menu_industrial__site1`).
    """
    IrModelData = env["ir.model.data"]
    existing = IrModelData.search(
        [
            ("module", "=", "website_avanzosc_demo"),
            ("name", "=", xml_id_name),
        ],
        limit=1,
    )
    if existing:
        return
    IrModelData.create(
        {
            "module": "website_avanzosc_demo",
            "name": xml_id_name,
            "model": "website.menu",
            "res_id": record.id,
            "noupdate": True,
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


def post_init_setup_languages(cr, registry):
    """Activate required languages and bind them to website 1.

    Why this exists (CLAUDE.md §11 D10):
        Spec D1 requires ES + EU as active site languages. In a fresh
        install on a new database, `eu_ES` defaults to `active=False`
        in `res.lang` and `website.language_ids` defaults to whatever
        was active at website creation time (typically just `en_US`).
        Without intervention, the site would render only English on
        a fresh install.

        We set this up imperatively at install time via this hook
        instead of using a `data/website_config.xml` with
        `<function model="res.lang" name="load_lang">` because:
          (a) the rest of our setup-operacional logic already lives
              in hooks (D7 menu hierarchy, D8 default cleanup) — same
              hooks.py file is the natural home for «what the website
              needs to look like after install».
          (b) `load_lang` xml-data semantics are fragile when the lang
              is already partially loaded (e.g. on -u after manual
              shell activation), requiring `noupdate=1` and exception
              handling. The imperative search-and-write here is
              idempotent without that fragility.

    Three idempotent steps:
        1. Activate `es_ES` and `eu_ES` in `res.lang` if not already
           active. Uses `with_context(active_test=False)` so we find
           inactive entries (search() with no context filters them out).
        2. Ensure `website.language_ids` for website 1 includes both
           langs (no-op if already there).
        3. Ensure `website.default_lang_id` for website 1 is `es_ES`
           (no-op if already so).

    Idempotency:
        - res.lang.write({'active': True}) is no-op if already True.
        - language_ids is many2many; we union with existing.
        - default_lang_id is m2o; we only write if differs.
        Re-running from shell or post_init is safe.

    Limitation:
        Only website id=1 is configured. If the BBDD has multiple
        websites, additional ones keep their own config. Acceptable
        for v1 (single website per CLAUDE.md §11 «Decisión D1»);
        revisit if multi-website returns in scope.
    """
    env = api.Environment(cr, SUPERUSER_ID, {})
    Lang = env["res.lang"].with_context(active_test=False)

    # Step 1: activate the required languages in res.lang.
    for code in _REQUIRED_LANG_CODES:
        lang = Lang.search([("code", "=", code)], limit=1)
        if lang and not lang.active:
            lang.write({"active": True})
        elif not lang:
            # Lang record doesn't exist yet — load it. Odoo's load_lang
            # creates the res.lang record with active=True. Defensive:
            # only invoked if search-then-update path didn't find it.
            env["res.lang"].load_lang(code)

    # Step 2 + 3: bind to website id=1 (default for the v1 site).
    website = env["website"].browse(1)
    if not website.exists():
        return

    es_lang = Lang.search([("code", "=", _DEFAULT_LANG_CODE)], limit=1)
    eu_lang = Lang.search([("code", "=", "eu_ES")], limit=1)
    if not (es_lang and eu_lang):
        return  # Lang setup failed earlier; bail out.

    target_lang_ids = es_lang | eu_lang
    current_lang_ids = website.language_ids
    missing = target_lang_ids - current_lang_ids
    if missing:
        website.write({"language_ids": [(4, lang.id) for lang in missing]})

    if website.default_lang_id != es_lang:
        website.write({"default_lang_id": es_lang.id})


def post_init_sync_homepage_meta(cr, registry):
    """Sprint B2 — sync homepage meta translations across multi-website
    view copies. Wraps the imperative method on `website` model so that
    on a fresh install the per-website copies of `website.homepage`
    receive the EU translation (rather than waiting for the next `-u`).

    The same call is also invoked via `<function>` in
    `data/website_meta.xml`, so on `-u` the sync also runs without
    re-installing.

    See `models/website_meta_sync.py` docstring for the architectural
    reason (Odoo per-website view duplication doesn't carry over
    `ir.translation` rows from the master).
    """
    env = api.Environment(cr, SUPERUSER_ID, {})
    env["website"]._avanzosc_sync_homepage_meta()


def _post_init_main(cr, registry):
    """Wrapper invoked by manifest 'post_init_hook'.

    Composes the four post-init sub-logics in deterministic order:
      1. post_init_setup_languages — activate ES + EU and bind to
         website 1 with ES as default (D10).
      2. post_init_menu_hierarchy — Soluciones dropdown children (D7).
      3. post_init_remove_odoo_defaults — cleanup of Odoo defaults (D8).
      4. post_init_sync_homepage_meta — Sprint B2 multi-website view
         translation sync.

    Languages run first because the menu hierarchy hook iterates over
    `env['website'].search([])` and consults `website.menu_id` per site.
    Having languages set up first ensures consistent state for any
    subsequent translation work that the menu hook might trigger.

    Homepage meta sync runs LAST because it depends on `i18n/eu.po`
    being already loaded (the master view's EU translation must be
    present in `ir.translation` before we copy it to per-website copies).
    Odoo loads .po files between data XML and post_init_hook, so the
    ordering is correct.
    """
    post_init_setup_languages(cr, registry)
    post_init_menu_hierarchy(cr, registry)
    post_init_remove_odoo_defaults(cr, registry)
    post_init_sync_homepage_meta(cr, registry)
