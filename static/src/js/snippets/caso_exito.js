odoo.define('website_avanzosc_demo.snippets.caso_exito', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // F1 — animación de entrada del SVG dashboard de §6 Caso éxito (home).
    // F1.1 v2 — hover dramático sobre bars + donut + KPI cards con dim del
    //          resto del dashboard.
    // F2 refactor — el orchestrator de hover (pointer events + dim + click
    //          toggle + auto-clear) se extrajo a `utils/hover_orchestrator`
    //          para reuso por equipo.js (F2). Comportamiento idéntico al
    //          de F1.1 v2 antes de la extracción; verificado empíricamente
    //          tras refactor.
    //
    // Selector: `.s_avanzosc_caso_exito.is-animated` (gating via t-call
    // body en home.xml). Las 4 sectoriales (sin la flag) NO instancian
    // este widget — el SVG queda en estado final estático y NO reacciona
    // a hover.
    //
    // Lifecycle del widget:
    //
    //   1. ENTRADA (F1) — al cruzar threshold IO 0.4 sobre la sección,
    //      one-shot:
    //        - KPIs: count-up rAF easeOutCubic 0→target (skipea KPIs sin
    //          data-target tras F1 cleanup → permanecen «—»).
    //        - Bars: stagger 80ms, class `.is-drawn` → CSS scaleY 0→1,
    //          600ms expo.out.
    //        - Donut: T+1100ms, class `.is-drawn` → CSS dashoffset 100→0,
    //          900ms expo.out.
    //
    //   2. HOVER ORCHESTRATOR (F1.1 v2 vía util F2) — listener desde
    //      start(), siempre activo (independiente de IO entrance). Util
    //      gestiona: pointerenter/leave per-target con gate pointerType,
    //      click delegado para touch toggle, auto-clear 2500ms,
    //      document click clearAllHovered. Toggle .is-hovered en target +
    //      data-hover-active en root (svg).
    //
    //   3. DESTROY — entrance observer + hover orchestrator destroy().
    //
    // Reduced-motion:
    //   - paintFinalAll directo en entrada (igual que F1).
    //   - hover orchestrator sigue activo (toggle .is-hovered al hover/tap),
    //     pero el SCSS bajo @include reduced-motion mata transitions y
    //     anula transforms/filters de hover. El dim (opacity 0.55) se
    //     mantiene como feedback visual binario sin transición.
    //
    // CSS contract con HTML:
    //   - Cada KPI envuelto en <g class="s_avanzosc_caso_exito_kpi_card">
    //     (3 cards). Bg rect dentro lleva clase `_card_bg` para hover stroke.
    //   - Bars: 6 <rect class="s_avanzosc_caso_exito_bar">.
    //   - Donut: 1 <path class="s_avanzosc_caso_exito_donut_fill">.
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');
    var countUp = require('website_avanzosc_demo.utils.count_up');
    var hoverUtil = require('website_avanzosc_demo.utils.hover_orchestrator');

    var IO_THRESHOLD = 0.4;
    var KPI_DURATION_MS = 1500;
    var BAR_DELAY_MS = 400;
    var BAR_STAGGER_MS = 80;
    var DONUT_DELAY_MS = 1100;

    // Selector compuesto para findHoverTarget del orchestrator — los 3
    // tipos de hover-target dentro del SVG. Single-source-of-truth.
    var HOVER_TARGET_SELECTOR =
        '.s_avanzosc_caso_exito_bar, ' +
        '.s_avanzosc_caso_exito_donut_fill, ' +
        '.s_avanzosc_caso_exito_kpi_card';

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
            var kpiCards = svg.querySelectorAll('.s_avanzosc_caso_exito_kpi_card');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // ============================================================
            // F1 — Entrance animation (paintFinalAll under reduce, IO otherwise)
            // ============================================================
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

            if (reducedMotion || !('IntersectionObserver' in window)) {
                paintFinalAll();
            } else {
                var triggered = false;
                var triggerSequence = function () {
                    if (triggered) return;
                    triggered = true;

                    for (var i = 0; i < kpiTexts.length; i++) {
                        countUp.animate(kpiTexts[i], KPI_DURATION_MS);
                    }
                    for (var j = 0; j < bars.length; j++) {
                        (function (bar, idx) {
                            window.setTimeout(function () {
                                bar.classList.add('is-drawn');
                            }, BAR_DELAY_MS + idx * BAR_STAGGER_MS);
                        })(bars[j], j);
                    }
                    if (donut) {
                        window.setTimeout(function () {
                            donut.classList.add('is-drawn');
                        }, DONUT_DELAY_MS);
                    }
                };

                var entranceObserver = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            triggerSequence();
                            entranceObserver.unobserve(section);
                        }
                    });
                }, { threshold: IO_THRESHOLD });
                entranceObserver.observe(section);
                this._entranceObserver = entranceObserver;
            }

            // ============================================================
            // F1.1 v2 — Hover orchestrator (extraído a util en F2)
            // ============================================================
            // La lógica de pointer events + dim + click toggle vive en
            // `utils/hover_orchestrator.js` (factory `createHoverOrchestrator`).
            // F2 (equipo.js) reusa el mismo util con root/targets distintos.
            var hoverTargets = [];
            for (var bi = 0; bi < bars.length; bi++) hoverTargets.push(bars[bi]);
            if (donut) hoverTargets.push(donut);
            for (var ci = 0; ci < kpiCards.length; ci++) hoverTargets.push(kpiCards[ci]);

            this._hoverOrch = hoverUtil.createHoverOrchestrator({
                root: svg,
                targets: hoverTargets,
                targetSelector: HOVER_TARGET_SELECTOR,
            });

            return this._super.apply(this, arguments);
        },

        destroy: function () {
            if (this._hoverOrch) {
                this._hoverOrch.destroy();
                this._hoverOrch = null;
            }
            return this._super.apply(this, arguments);
        },
    });
});
