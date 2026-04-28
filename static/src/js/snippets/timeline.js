odoo.define('website_avanzosc_demo.snippets.timeline', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Snippet `s_avanzosc_timeline` — GSAP-powered staggered reveal
    // (Task 3.8). Primer snippet que usa GSAP de verdad.
    //
    // Patrón:
    //   IntersectionObserver triggera el reveal cuando la sección entra
    //   30% en viewport. Tras dispararse, se llama a `gsap.from()` sobre
    //   los items con stagger 100ms, ease-out expo, duración 600ms,
    //   propiedades animadas: opacity 0 → 1, y 20px → 0. One-shot.
    //
    // Por qué IO en lugar de ScrollTrigger:
    //   ScrollTrigger requiere `scroller-proxy` + sync con Lenis (~30
    //   líneas de integración) para funcionar correctamente en el
    //   `#wrapwrap` de Odoo. Para «reveal una vez al entrar viewport»
    //   IO + gsap.from() es funcionalmente equivalente y mucho más
    //   simple. Si una tarea futura necesita scrub-on-scroll progress
    //   (línea timeline crece con el scroll percent), revisitar la
    //   integración Lenis-ScrollTrigger en una tarea aparte. Decisión
    //   sesión 2026-04-28 documented en commit body.
    //
    // Reduced-motion:
    //   No se ejecuta gsap.from() — los items quedan en su estado CSS
    //   natural (visible). El SCSS no aplica opacity:0 inicial precisamente
    //   por esto: el «from» state de GSAP es el hidden, el «to» state es
    //   el render natural. Saltar gsap = render natural inmediato.
    //
    // Fallback sin IntersectionObserver / sin GSAP:
    //   Defensive checks. Si IO no existe (navegadores muy antiguos),
    //   ejecutamos gsap directamente al `start()`. Si gsap no está cargado
    //   (CDN failure), no-op (los items quedan visibles por CSS natural).
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    var THRESHOLD = 0.3;

    publicWidget.registry.AvanzoscTimeline = publicWidget.Widget.extend({
        selector: '.s_avanzosc_timeline',

        start: function () {
            var section = this.el;
            var items = section.querySelectorAll('.s_avanzosc_timeline_item');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Reduced-motion or no GSAP: leave items in natural state.
            if (reducedMotion) {
                return this._super.apply(this, arguments);
            }
            if (typeof window.gsap === 'undefined') {
                console.warn('[website_avanzosc_demo] GSAP not loaded, timeline reveal skipped');
                return this._super.apply(this, arguments);
            }

            var revealed = false;
            function reveal() {
                if (revealed) return;
                revealed = true;
                window.gsap.from(items, {
                    opacity: 0,
                    y: 20,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: 'expo.out',
                });
            }

            if (!('IntersectionObserver' in window)) {
                // Fallback: reveal inmediato si IO no soportado.
                reveal();
                return this._super.apply(this, arguments);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        reveal();
                        observer.unobserve(section);
                    }
                });
            }, { threshold: THRESHOLD });

            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
});
