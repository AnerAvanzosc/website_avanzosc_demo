odoo.define('website_avanzosc_demo.snippets.pilares', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Snippet `s_avanzosc_pilares` — reveal-on-scroll mínimo (Task 3.1).
    // Ref: spec §6.2, plan §3.1, CLAUDE.md §5 (solo transform + opacity).
    //
    // Patrón:
    //   - IntersectionObserver con threshold 0.2 (sección 20% visible).
    //   - Al disparar, añade clase `.is-revealed` al elemento sección.
    //   - El SCSS (_pilares.scss) define la transición desde hidden
    //     (opacity 0 + translateY 20px) a visible, con stagger 100ms
    //     entre las 3 columnas via :nth-child + transition-delay.
    //   - `unobserve()` tras revelar — la animación es one-shot, no
    //     queremos re-disparar al volver a entrar en viewport (CLAUDE.md
    //     §5 «contador anima sólo una vez» principio aplica también aquí).
    //
    // Reduced-motion:
    //   El SCSS neutraliza la animación (transition: none + opacity 1
    //   + transform none) bajo `@media (prefers-reduced-motion: reduce)`.
    //   El JS añade `is-revealed` igualmente — la clase no es perjudicial
    //   bajo reduced-motion (el SCSS la fuerza a estado final
    //   independientemente). Mantenerlo simple en JS.
    //
    // Fallback sin IntersectionObserver:
    //   Navegadores muy antiguos que no soportan IO no son objetivo de
    //   v1, pero la fallback existe defensivamente: añade `is-revealed`
    //   inmediatamente para que el contenido sea al menos visible (sin
    //   animación). Aceptable degradación.
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscPilares = publicWidget.Widget.extend({
        selector: '.s_avanzosc_pilares',

        start: function () {
            var section = this.el;

            if (!('IntersectionObserver' in window)) {
                // Defensive fallback: navegadores sin IO ven el snippet
                // ya revelado, sin animación.
                section.classList.add('is-revealed');
                return this._super.apply(this, arguments);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        section.classList.add('is-revealed');
                        // One-shot: tras revelar, dejamos de observar.
                        observer.unobserve(section);
                    }
                });
            }, { threshold: 0.2 });

            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
});
