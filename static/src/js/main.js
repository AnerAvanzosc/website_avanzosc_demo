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
            // ----------------------------------------------------------------
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // No-op: respect user preference
            } else if (typeof window.Lenis === 'function') {
                var lenis = new window.Lenis();
                window.lenis = lenis;

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
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

            return this._super.apply(this, arguments);
        },
    });

    return publicWidget.registry.AvanzoscRoot;
});
