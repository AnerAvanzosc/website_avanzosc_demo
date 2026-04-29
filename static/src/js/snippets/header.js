odoo.define('website_avanzosc_demo.snippets.header', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Phase 7.2 — Mobile overlay controller.
    //
    // Behaviors:
    //   1. Click hamburger (.s_avanzosc_hamburger) → open overlay
    //      (add `.is-open` class, lock body scroll, set aria-hidden=false,
    //       update aria-expanded on hamburger).
    //   2. Click close button (.s_avanzosc_mobile_overlay_close) → close.
    //   3. Press Escape (when overlay open) → close.
    //   4. Click any link inside overlay (nav links + lang switcher) →
    //      close overlay before browser navigation completes.
    //   5. Click «Soluciones» toggle → expand/collapse the submenu
    //      accordion (CSS-only; this only toggles `.is-expanded` class).
    //   6. NO click-outside close (per decision 2026-04-29 — overlay
    //      covers full viewport, X button + Escape + link-click cover
    //      every dismissal path; outside-click ambiguous in mobile).
    //
    // Body scroll lock: while overlay is open we add class
    // `.s_avanzosc_mobile_overlay_open` to <body>. SCSS sets
    // `overflow: hidden` to prevent scrolling the page underneath.
    //
    // Accessibility:
    //   - aria-hidden on overlay (true closed, false open).
    //   - aria-expanded on hamburger (false closed, true open).
    //   - aria-expanded on Soluciones toggle (false collapsed, true).
    //   - Focus moves into overlay when opened (first focusable = X).
    //   - Focus restores to hamburger when closed.
    //
    // Reduced-motion: CSS handles the fade transition cancellation via
    // `@include reduced-motion` mixin — JS does NOT branch on
    // matchMedia. Class toggling stays the same; only the visual
    // transition disappears. Functional behavior identical.
    //
    // Why publicWidget on .s_avanzosc_hamburger and not on the overlay
    // itself: Odoo's publicWidget instantiates one widget per matched
    // selector. The hamburger is the trigger (always present in DOM);
    // it owns the overlay reference and binds all listeners. Single
    // entry point keeps state contained.
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscMobileOverlay = publicWidget.Widget.extend({
        selector: '.s_avanzosc_hamburger',
        events: {
            'click': '_onHamburgerClick',
        },

        start: function () {
            this.overlay = document.getElementById('s_avanzosc_mobile_overlay');
            this.body = document.body;

            if (!this.overlay) {
                // Defensive: si el overlay no se renderizó (e.g. se ha
                // editado el layout y se ha removido), salir sin error.
                return this._super.apply(this, arguments);
            }

            this.closeBtn = this.overlay.querySelector('.s_avanzosc_mobile_overlay_close');
            this.dropdownToggle = this.overlay.querySelector('.s_avanzosc_mobile_overlay_dropdown_toggle');
            this.dropdownItem = this.overlay.querySelector('.s_avanzosc_mobile_overlay_dropdown');
            this.links = this.overlay.querySelectorAll('a');

            this._bindOverlayHandlers();

            return this._super.apply(this, arguments);
        },

        // ---- Public methods ---------------------------------------------

        _open: function () {
            this.overlay.classList.add('is-open');
            this.overlay.setAttribute('aria-hidden', 'false');
            this.el.setAttribute('aria-expanded', 'true');
            this.body.classList.add('s_avanzosc_mobile_overlay_open');
            // Move focus into overlay (X close is first focusable).
            if (this.closeBtn) {
                this.closeBtn.focus();
            }
        },

        _close: function () {
            this.overlay.classList.remove('is-open');
            this.overlay.setAttribute('aria-hidden', 'true');
            this.el.setAttribute('aria-expanded', 'false');
            this.body.classList.remove('s_avanzosc_mobile_overlay_open');
            // Collapse the accordion if it was expanded.
            if (this.dropdownItem) {
                this.dropdownItem.classList.remove('is-expanded');
                if (this.dropdownToggle) {
                    this.dropdownToggle.setAttribute('aria-expanded', 'false');
                }
            }
            // Restore focus to hamburger.
            this.el.focus();
        },

        _toggleAccordion: function () {
            if (!this.dropdownItem) return;
            var expanded = this.dropdownItem.classList.toggle('is-expanded');
            if (this.dropdownToggle) {
                this.dropdownToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            }
        },

        // ---- Event handlers ---------------------------------------------

        _onHamburgerClick: function (ev) {
            ev.preventDefault();
            this._open();
        },

        _bindOverlayHandlers: function () {
            var self = this;

            // Close button.
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', function (ev) {
                    ev.preventDefault();
                    self._close();
                });
            }

            // Soluciones accordion toggle.
            if (this.dropdownToggle) {
                this.dropdownToggle.addEventListener('click', function (ev) {
                    ev.preventDefault();
                    self._toggleAccordion();
                });
            }

            // Escape key — global listener, only acts when overlay is open.
            document.addEventListener('keydown', function (ev) {
                if (ev.key === 'Escape' && self.overlay.classList.contains('is-open')) {
                    self._close();
                }
            });

            // All links inside overlay → close overlay before nav.
            // Browser handles navigation natively; we just clean up state.
            this.links.forEach(function (link) {
                link.addEventListener('click', function () {
                    // No preventDefault — let the browser navigate normally.
                    self._close();
                });
            });
        },
    });
});
