/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import countUp from "@website_avanzosc_demo/js/utils/count_up";

    // -------------------------------------------------------------------
    // Snippet `s_avanzosc_pilares` — reveal-on-scroll + F3 v4 entries.
    //
    // Original (Task 3.1): IO threshold 0.2 + class `.is-revealed` en la
    // sección. SCSS hace stagger 0/100/200ms entre las 3 columnas via
    // :nth-child + transition-delay.
    //
    // F3 v7: animaciones específicas por pilar al disparar el reveal:
    //   - Pilar 1 («17» años): count-up 0→17, 1500ms easeOutCubic via
    //     count_up util.
    //   - Pilar 2 («OCA»): ruleta slot-machine 3 rodillos sincronizados,
    //     paradas escalonadas. Initials 'A'/'M'/'I', settled 'O'/'C'/'A'.
    //     14/16/18 saltos × 43ms = 602/688/774ms.
    //   - Pilar 3 («STEM»): MISMA ruleta slot-machine que OCA (F3 v7
    //     nuevo). 4 rodillos sincronizados, paradas escalonadas.
    //     Initials 'E'/'D'/'M'/'S', settled 'S'/'T'/'E'/'M'.
    //     14/16/18/20 saltos × 43ms = 602/688/774/860ms.
    //
    // Helper compartido: processWordRoulette(el, finalText) hace
    // Splitting + alphabetRoulette para cualquier palabra-símbolo.
    //
    // Trigger único IO 0.2 sobre la sección. Cuando dispara:
    //   1. classList.add('is-revealed') en sección — SCSS reveal stagger
    //      del item.
    //   2. setTimeout 200ms → arranca animateNumbers() + processStemReveal()
    //      + processOcaRoulette().
    //
    // Reduced-motion:
    //   - Numbers: paintFinal directo.
    //   - STEM: sin Splitting, span muestra «STEM» literal.
    //   - OCA: sin Splitting ni roulette, span muestra «OCA» literal.
    //   - SCSS bajo @include reduced-motion garantiza visibilidad final
    //     defensiva incluso si quedaran chars residuales.
    //
    // Fallback sin IntersectionObserver: estado final inmediato +
    // procesos disparados directo (sin delay).
    // -------------------------------------------------------------------

const REVEAL_THRESHOLD = 0.2;
const TRIGGER_DELAY_MS = 200;
const NUMBER_DURATION_MS = 1500;
    var ROULETTE_INTERVAL_MS = 43;             // ms por salto, igual para los 3 chars.
    var ROULETTE_MAX_STEPS_BASE = 14;          // saltos del rodillo «máster» (char 0).
    var ROULETTE_STOP_STAGGER_STEPS = 2;       // cada char i para 2*i saltos más tarde.

    // Ruleta tipo slot-machine sobre chars [Splitting-wrapped]: 3 rodillos
    // arrancan AL MISMO TIEMPO y giran al mismo ritmo (43ms por salto).
    // Cada rodillo para con stagger de 2 saltos (≈86ms) — char 0 primero,
    // char 1 segundo, char 2 tercero.
    //
    // F3 v6 — slot-machine algorithm:
    //   maxSteps[i]   = ROULETTE_MAX_STEPS_BASE + i * ROULETTE_STOP_STAGGER_STEPS.
    //   initialIdx[i] = ((relIndex - maxSteps + 26) mod 26) — calcula la
    //                   letra de arranque para que tras `maxSteps` saltos
    //                   se aterrice exactamente en la letra final por
    //                   aritmética modular del alfabeto (26 letras).
    //   Ejemplos OCA:
    //     - char 0 'O' (rel=14, steps=14): initial = (14-14+26)%26 = 0 → 'A'.
    //     - char 1 'C' (rel=2,  steps=16): initial = (2-16+26)%26 = 12 → 'M'.
    //     - char 2 'A' (rel=0,  steps=18): initial = (0-18+26)%26 = 8 → 'I'.
    //
    //   Tick i: textContent = String.fromCharCode(65 + (initialIdx + i) % 26).
    //   Cuando tick alcanza maxSteps, clearInterval. textContent queda en
    //   finalText[idx] por la propia aritmética modular.
    //
    // Lanzamiento sincronizado: NO stagger inter-char en arranque. Los 3
    // setIntervals se crean en la misma task. La sensación es slot-machine
    // clásico (3 rodillos en sync, paradas escalonadas).
    //
    // Defensa: si maxSteps llega a 0 (formula no produce esto con valores
    // actuales pero por si futuras tweaks), set directo sin loop.
    function alphabetRoulette(charsNodeList, finalText) {
        for (var i = 0; i < charsNodeList.length; i++) {
            (function (charEl, idx) {
                var targetCode = finalText.charCodeAt(idx);
                var relIndex = targetCode - 65;

                // Fuera de A-Z: set directo (defensa).
                if (relIndex < 0 || relIndex > 25) {
                    charEl.textContent = finalText[idx];
                    return;
                }

                var maxSteps = ROULETTE_MAX_STEPS_BASE + (idx * ROULETTE_STOP_STAGGER_STEPS);
                if (maxSteps === 0) {
                    charEl.textContent = finalText[idx];
                    return;
                }

                var initialIdx = ((relIndex - maxSteps) % 26 + 26) % 26;
                charEl.textContent = String.fromCharCode(65 + initialIdx);

                var tick = 0;
                var intervalId = window.setInterval(function () {
                    tick++;
                    if (tick >= maxSteps) {
                        charEl.textContent = finalText[idx];
                        window.clearInterval(intervalId);
                        return;
                    }
                    charEl.textContent = String.fromCharCode(65 + (initialIdx + tick) % 26);
                }, ROULETTE_INTERVAL_MS);
            })(charsNodeList[i], i);
        }
    }

    publicWidget.registry.AvanzoscPilares = publicWidget.Widget.extend({
        selector: '.s_avanzosc_pilares',

        start: function () {
            var section = this.el;
            var numbers = section.querySelectorAll('.s_avanzosc_pilares_number[data-target]');
            var stem = section.querySelector('.s_avanzosc_pilares_stem');
            var oca = section.querySelector('.s_avanzosc_pilares_oca');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            function animateNumbers() {
                for (var i = 0; i < numbers.length; i++) {
                    countUp.animate(numbers[i], NUMBER_DURATION_MS);
                }
            }
            function paintFinalNumbers() {
                for (var i = 0; i < numbers.length; i++) {
                    countUp.paintFinal(numbers[i]);
                }
            }
            // Helper compartido para palabras-símbolo (OCA + STEM): hace
            // Splitting wrap + arranca alphabetRoulette. alphabetRoulette
            // setea cada char a su initialIdx calculado en su primer
            // statement (no hace falta reset previo).
            function processWordRoulette(el, finalText) {
                if (!el) return;
                if (typeof window.Splitting !== 'function') return;
                if (el.dataset.split !== 'true') {
                    window.Splitting({ target: el, by: 'chars' });
                    el.dataset.split = 'true';
                }
                var chars = el.querySelectorAll('.char');
                if (chars.length === 0) return;
                alphabetRoulette(chars, finalText);
            }

            // Reduced-motion: estado final directo, sin IO ni delays ni
            // Splitting ni roulette. Spans muestran texto literal.
            if (reducedMotion) {
                section.classList.add('is-revealed');
                paintFinalNumbers();
                return this._super.apply(this, arguments);
            }

            if (!('IntersectionObserver' in window)) {
                // Fallback antiguo: estado final inmediato.
                section.classList.add('is-revealed');
                paintFinalNumbers();
                processWordRoulette(oca, 'OCA');
                processWordRoulette(stem, 'STEM');
                return this._super.apply(this, arguments);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    section.classList.add('is-revealed');
                    window.setTimeout(function () {
                        animateNumbers();
                        processWordRoulette(oca, 'OCA');
                        processWordRoulette(stem, 'STEM');
                    }, TRIGGER_DELAY_MS);
                    observer.unobserve(section);
                });
            }, { threshold: REVEAL_THRESHOLD });
            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
