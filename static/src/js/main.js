odoo.define('website_avanzosc_demo.main', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscRoot = publicWidget.Widget.extend({
        selector: '#wrap',
        start: function () {
            // ----------------------------------------------------------------
            // Lenis smooth scroll — inicialización global.
            // No inicializar si el usuario tiene prefers-reduced-motion: reduce
            // activado. CLAUDE.md §5, spec §9.1 (Lenis 1.0.42).
            // La librería CDN se carga vía views/assets.xml (task 0.4).
            // window.lenis expuesto para diagnóstico (Playwright / DevTools).
            //
            // Wrapper = `#wrapwrap` (Odoo Community v14): el módulo `website`
            // pone `overflow: hidden` en `html, body, #wrapwrap` y usa
            // `#wrapwrap` (height = viewport, overflow: auto) como el único
            // elemento que realmente scrollea. Sin `wrapper: wrapwrap`, Lenis
            // se ata a window que no scrollea — quedaba idle en `isScrolling:
            // false` permanente sin aportar nada (bug de Task 0.6 detectado
            // durante la implementación de Task 1.3).
            //
            // Content = wrapwrap (mismo elemento que wrapper): el DOM real
            // tiene `#wrapwrap > {header, main, footer}` como hijos paralelos,
            // sin un wrapper único intermedio. `content: wrapwrap` hace que
            // Lenis mida `wrapwrap.offsetHeight` (que abarca los 3 hijos)
            // para calcular el scroll-limit. Decisión sesión 2026-04-28
            // («(α)+(ε)») validada empíricamente.
            //
            // autoToggle: true — defensivo: Lenis se auto-pausa si el wrapper
            // no necesita smoothing (e.g. contenido más corto que viewport).
            // ----------------------------------------------------------------
            var wrapwrap = document.getElementById('wrapwrap');
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // No-op: respect user preference. window.lenis queda undefined.
            } else if (wrapwrap && typeof window.Lenis === 'function') {
                var lenis = new window.Lenis({
                    wrapper: wrapwrap,
                    content: wrapwrap,
                    autoToggle: true,
                });
                window.lenis = lenis;

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
            } else if (typeof window.Lenis === 'undefined') {
                // CDN failure (network block, ad-blocker, etc.). Sticky header
                // falls back to native scroll path on `#wrapwrap` per Task 1.3.
                console.warn('[website_avanzosc_demo] Lenis CDN unavailable, smooth scroll disabled');
            }

            // ----------------------------------------------------------------
            // Lucide Icons: reemplaza todos los elementos con atributo
            // data-lucide por el SVG correspondiente.
            // La librería CDN lucide.min.js se carga desde <head> vía
            // views/assets.xml (template head_external_assets).
            // Ref: CLAUDE.md §9.7, spec §3.3 punto 2.
            // ----------------------------------------------------------------
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }

            // ----------------------------------------------------------------
            // Sticky header — clase «is-scrolled» (Task 1.3)
            // ----------------------------------------------------------------
            // Sticky position lo proporciona el SCSS (_header.scss). Aquí
            // solo añadimos/quitamos la clase `is-scrolled` cuando el scroll
            // pasa de 100px en `#wrapwrap` (el elemento que realmente
            // scrollea en Odoo 14 — html/body tienen overflow: hidden).
            //
            // Listener dual:
            //   - Lenis activo (no reduced-motion): `lenis.on('scroll', cb)`
            //     es el patrón canónico per la API de Lenis 1.0.42. El
            //     callback recibe la instancia y leemos `lenis.scroll`. No
            //     necesita rAF throttle propio — Lenis ya emite el evento al
            //     ritmo del rAF interno.
            //   - Reduced-motion (Lenis no instanciado, ver bloque arriba):
            //     `#wrapwrap.addEventListener('scroll', ...)` nativo con
            //     throttle rAF (1 frame ≈ 16ms). Leemos `wrapwrap.scrollTop`.
            //
            // Threshold = 100px (briefing 1.3). Transición visual la maneja
            // el SCSS (padding + box-shadow, 250ms ease-out expo).
            // ----------------------------------------------------------------
            var headerEl = document.querySelector('header');
            if (headerEl && wrapwrap) {
                var SCROLL_THRESHOLD = 100;
                var applyScrolledState = function (scrollValue) {
                    headerEl.classList.toggle(
                        'is-scrolled',
                        scrollValue > SCROLL_THRESHOLD
                    );
                };
                if (window.lenis && typeof window.lenis.on === 'function') {
                    // Lenis canonical event — fires on smooth scroll animation.
                    window.lenis.on('scroll', function (lenis) {
                        applyScrolledState(lenis.scroll);
                    });
                    applyScrolledState(window.lenis.scroll);
                } else {
                    // Reduced-motion fallback: native scroll on wrapwrap with rAF.
                    var ticking = false;
                    var checkScroll = function () {
                        ticking = false;
                        applyScrolledState(wrapwrap.scrollTop);
                    };
                    wrapwrap.addEventListener('scroll', function () {
                        if (!ticking) {
                            ticking = true;
                            window.requestAnimationFrame(checkScroll);
                        }
                    }, { passive: true });
                    applyScrolledState(wrapwrap.scrollTop);
                }
            }

            return this._super.apply(this, arguments);
        },
    });

    return publicWidget.registry.AvanzoscRoot;
});
