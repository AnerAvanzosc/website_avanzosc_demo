odoo.define('website_avanzosc_demo.snippets.caso_exito', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // F1 — animación de entrada del SVG dashboard de §6 Caso éxito (home).
    //
    // Selector: `.s_avanzosc_caso_exito.is-animated`. El modificador
    // `.is-animated` lo añade el snippet QWeb solo cuando el llamador pasa
    // `caso_exito_animated=True` en el body del t-call (home.xml). Las 4
    // sectoriales NO lo pasan → el widget no engancha → el SVG queda en
    // estado final estático.
    //
    // Secuencia (T=0 cuando la sección cruza threshold IO 0.4):
    //   - KPIs    T=0    → T=1500ms : count-up rAF easeOutCubic (util
    //                                  compartida con contador.js).
    //   - Bars    T=400  → T≈1200ms : scaleY 0→1 (CSS class toggle), 6
    //                                  barras stagger 80ms izq→der,
    //                                  duration 600ms expo.out.
    //   - Donut   T=1100 → T=2000ms : stroke-dashoffset 100→0 (CSS class
    //                                  toggle, pathLength=100), 900ms
    //                                  expo.out.
    //
    // Reduced-motion / sin IO: paintFinalAll directo (KPIs target,
    // bars y donut con clase is-drawn → estado final). Reproduce el
    // patrón paintFinal de contador.js.
    //
    // Coexistencia con reveal padre: la sección sigue teniendo
    // `data-avanzosc-reveal=""` → el widget genérico `AvanzoscReveal`
    // (reveal.js) toggle `.is-revealed` con threshold 0.2 (opacity 0→1
    // 600ms expo). Este widget es independiente y observa con threshold
    // 0.4. Un mismo elemento puede ser observado por dos IO simultáneos
    // sin conflicto.
    //
    // No usa GSAP: las animaciones (scale + stroke-dashoffset) son
    // CSS transition + class toggle, idiomático del codebase. No hay
    // residuo de inline styles (gotcha 16) y la curva expo.out queda
    // declarativa en SCSS.
    //
    // No usa scroll listeners (#wrapwrap ya saturado por hero +
    // timeline pin). IO único sobre la sección, una vez.
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');
    var countUp = require('website_avanzosc_demo.utils.count_up');

    var IO_THRESHOLD = 0.4;
    var KPI_DURATION_MS = 1500;
    var BAR_DELAY_MS = 400;
    var BAR_STAGGER_MS = 80;
    var DONUT_DELAY_MS = 1100;

    publicWidget.registry.AvanzoscCasoExito = publicWidget.Widget.extend({
        selector: '.s_avanzosc_caso_exito.is-animated',

        start: function () {
            var section = this.el;
            var svg = section.querySelector('.s_avanzosc_caso_exito_svg');
            if (!svg) {
                return this._super.apply(this, arguments);
            }

            var kpiTexts = svg.querySelectorAll('.s_avanzosc_caso_exito_kpi_text');
            var bars = svg.querySelectorAll('.s_avanzosc_caso_exito_bar');
            var donut = svg.querySelector('.s_avanzosc_caso_exito_donut_fill');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            function paintFinalAll() {
                for (var i = 0; i < kpiTexts.length; i++) {
                    countUp.paintFinal(kpiTexts[i]);
                }
                for (var j = 0; j < bars.length; j++) {
                    bars[j].classList.add('is-drawn');
                }
                if (donut) {
                    donut.classList.add('is-drawn');
                }
            }

            // Reduced-motion or no IO: estado final directo, sin animación.
            // Mismo patrón que contador.js paintFinal — el SCSS bajo
            // `@media (prefers-reduced-motion: reduce)` neutraliza las
            // transitions, así que añadir `.is-drawn` no dispara animación
            // (estado final aplicado por la regla CSS, transition: none).
            if (reducedMotion || !('IntersectionObserver' in window)) {
                paintFinalAll();
                return this._super.apply(this, arguments);
            }

            var triggered = false;
            function triggerSequence() {
                if (triggered) return;
                triggered = true;

                // KPIs: T=0.
                for (var i = 0; i < kpiTexts.length; i++) {
                    countUp.animate(kpiTexts[i], KPI_DURATION_MS);
                }

                // Bars: T=400ms, stagger 80ms, orden DOM (izq→der por
                // construcción del template QWeb).
                for (var j = 0; j < bars.length; j++) {
                    (function (bar, idx) {
                        window.setTimeout(function () {
                            bar.classList.add('is-drawn');
                        }, BAR_DELAY_MS + idx * BAR_STAGGER_MS);
                    })(bars[j], j);
                }

                // Donut: T=1100ms.
                if (donut) {
                    window.setTimeout(function () {
                        donut.classList.add('is-drawn');
                    }, DONUT_DELAY_MS);
                }
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        triggerSequence();
                        observer.unobserve(section);
                    }
                });
            }, { threshold: IO_THRESHOLD });
            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
});
