odoo.define('website_avanzosc_demo.snippets.reveal', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Generic reveal-on-scroll widget — Phase 3 shared infrastructure.
    // Introduced en Task 3.2; usado por 3.2 (sectores), 3.3 (cta_kit),
    // 3.4 (cta_contacto), y futuros snippets que solo necesiten un toggle
    // de clase `.is-revealed` al entrar en viewport.
    //
    // Patrón de uso:
    //   1. Añadir el atributo `data-avanzosc-reveal` al elemento <section>
    //      raíz del snippet en su template QWeb.
    //   2. Definir la transición CSS en el SCSS del snippet, accionada por
    //      la clase `.is-revealed` que este widget toggle.
    //
    // Comparación con `pilares.js` (Task 3.1):
    //   pilares.js usa selector class-based específico (.s_avanzosc_pilares)
    //   por convención inicial; este widget usa selector data-attr genérico
    //   reutilizable. Ambos coexisten — pilares mantiene su widget propio
    //   por scope discipline (no modificar Task 3.1 al introducir el
    //   genérico). Si en el futuro se decide unificar, pilares puede
    //   adoptar el atributo y eliminarse pilares.js (Phase 3 cleanup).
    //
    // Threshold:
    //   0.2 (sección 20% visible) — coherente con pilares.js. Si una tarea
    //   futura necesita threshold distinto, leer `data-avanzosc-reveal`
    //   value como número, e.g. `data-avanzosc-reveal="0.5"`. Por ahora
    //   v1 unifica en 0.2.
    //
    // One-shot: tras revelar, `unobserve()` para no re-disparar al
    // re-entrar en viewport (CLAUDE.md §5 «contador anima sólo una vez»
    // principio aplica también aquí).
    //
    // Reduced-motion: el SCSS de cada snippet es responsable de neutralizar
    // la transición vía `@include reduced-motion`. Este widget añade la
    // clase igualmente (inocuo bajo reduced-motion porque el CSS la fuerza
    // a estado final independientemente).
    //
    // Fallback sin IntersectionObserver: añade `.is-revealed` inmediatamente
    // (degradación aceptable para navegadores muy antiguos no objetivo de v1).
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscReveal = publicWidget.Widget.extend({
        selector: '[data-avanzosc-reveal]',

        start: function () {
            var section = this.el;

            if (!('IntersectionObserver' in window)) {
                section.classList.add('is-revealed');
                return this._super.apply(this, arguments);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        section.classList.add('is-revealed');
                        observer.unobserve(section);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
});
