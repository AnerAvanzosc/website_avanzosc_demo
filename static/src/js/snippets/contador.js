/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import countUp from "@website_avanzosc_demo/js/utils/count_up";

    // -------------------------------------------------------------------
    // Snippet `s_avanzosc_contador` — animated count-up (Task 3.5).
    // Ref: spec §6.6, plan §3.5, CLAUDE.md §5 (transform/opacity only),
    //      §9.8 (números grandes editorial).
    //
    // Patrón:
    //   - Cada `.s_avanzosc_contador_number` tiene `data-target` con el
    //     valor final y `data-suffix` con un sufijo opcional (e.g. "+").
    //   - Al entrar el contenedor `.s_avanzosc_contador` 50% en viewport,
    //     IntersectionObserver dispara la animación de cuenta progresiva
    //     en TODOS los `.s_avanzosc_contador_number` del bloque a la vez.
    //   - rAF loop con interpolación easeOutCubic. Duración 1500ms.
    //   - One-shot por instancia (flag `data-counted="true"` tras animar)
    //     para no re-disparar al re-entrar en viewport — coherente con la
    //     guidance del plan §3.5: «sólo se anima la primera vez».
    //   - Sufijo `data-suffix` se concatena al render del valor cada
    //     frame (e.g. el contador de «600+» muestra «0+, 1+, 2+...» tijera
    //     fluida hasta «600+» final). Si querés sufijo solo al final,
    //     ajustar el render en update() para condicional.
    //
    // Reduced-motion:
    //   Si `prefers-reduced-motion: reduce` matches, el JS pinta directo
    //   el target con sufijo (sin rAF loop). Estado final inmediato.
    //
    // Fallback sin IntersectionObserver:
    //   Pinta target directo (igual que reduced-motion). Mejor UX que
    //   dejar el placeholder «0» indefinidamente.
    //
    // Independiente del widget genérico AvanzoscReveal (reveal.js): aquel
    // toggle de `.is-revealed` para el reveal de los items completos
    // (opacity + translateY). Esta animación de cuenta es semánticamente
    // distinta y merece su propio observer + timing.
    // -------------------------------------------------------------------

// F1 refactor: la lógica de count-up (easeOutCubic + animate + paintFinal)
// se extrajo a `website_avanzosc_demo.utils.count_up` para que F1
// (caso_exito.js KPI animación del SVG dashboard) la reutilice sin
// duplicar. Comportamiento idéntico al previo: 1500ms easeOutCubic,
// one-shot via `data-counted="true"`, threshold IO 0.5.
const THRESHOLD = 0.5;

publicWidget.registry.AvanzoscContador = publicWidget.Widget.extend({
        selector: '.s_avanzosc_contador',

        start: function () {
            var section = this.el;
            var numbers = section.querySelectorAll('.s_avanzosc_contador_number');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Reduced-motion or no IO: paint final directly.
            if (reducedMotion || !('IntersectionObserver' in window)) {
                numbers.forEach(countUp.paintFinal);
                return this._super.apply(this, arguments);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        numbers.forEach(function (n) {
                            countUp.animate(n);
                        });
                        observer.unobserve(section);
                    }
                });
            }, { threshold: THRESHOLD });

            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
