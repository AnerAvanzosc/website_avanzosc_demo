odoo.define('website_avanzosc_demo.snippets.contador', function (require) {
    'use strict';

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

    var publicWidget = require('web.public.widget');

    var DURATION_MS = 1500;
    var THRESHOLD = 0.5;

    function easeOutCubic(t) {
        // t en [0, 1]. Curva ease-out cubic.
        return 1 - Math.pow(1 - t, 3);
    }

    publicWidget.registry.AvanzoscContador = publicWidget.Widget.extend({
        selector: '.s_avanzosc_contador',

        start: function () {
            var section = this.el;
            var numbers = section.querySelectorAll('.s_avanzosc_contador_number');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Helper: paint final state (target + suffix) on a given node.
            function paintFinal(node) {
                var target = parseInt(node.getAttribute('data-target') || '0', 10);
                var suffix = node.getAttribute('data-suffix') || '';
                node.textContent = target + suffix;
                node.setAttribute('data-counted', 'true');
            }

            // Helper: animate count-up on a given node.
            function animate(node) {
                if (node.getAttribute('data-counted') === 'true') return;
                var target = parseInt(node.getAttribute('data-target') || '0', 10);
                var suffix = node.getAttribute('data-suffix') || '';
                var startTime = null;

                function step(now) {
                    if (!startTime) startTime = now;
                    var elapsed = now - startTime;
                    var t = Math.min(1, elapsed / DURATION_MS);
                    var current = Math.round(target * easeOutCubic(t));
                    node.textContent = current + suffix;
                    if (t < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        node.setAttribute('data-counted', 'true');
                    }
                }
                window.requestAnimationFrame(step);
            }

            // Reduced-motion or no IO: paint final directly.
            if (reducedMotion || !('IntersectionObserver' in window)) {
                numbers.forEach(paintFinal);
                return this._super.apply(this, arguments);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        numbers.forEach(animate);
                        observer.unobserve(section);
                    }
                });
            }, { threshold: THRESHOLD });

            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
});
