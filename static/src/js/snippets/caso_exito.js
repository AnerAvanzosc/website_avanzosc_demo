odoo.define('website_avanzosc_demo.snippets.caso_exito', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // F1 — animación de entrada del SVG dashboard de §6 Caso éxito (home).
    // F1.1 v2 — hover dramático sobre bars + donut + KPI cards con dim del
    //          resto del dashboard. Reemplaza F1.1 v1 (commit 1025004,
    //          descartado por hover demasiado tímido).
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
    //   2. HOVER ORCHESTRATOR (F1.1 v2) — listener desde start(), siempre
    //      activo (independiente de IO entrance):
    //
    //        Desktop (mouse):
    //          - pointerenter sobre target → clearAllHovered + addHoverIn.
    //          - pointerleave sobre target → handleHoverOut.
    //          - addHoverIn(t): t.classList.add('is-hovered') + svg
    //            data-hover-active.
    //          - handleHoverOut(t): t.classList.remove('is-hovered') + si
    //            ningún .is-hovered queda → svg sin data-hover-active.
    //
    //        Mobile (touch):
    //          - click sobre target alterna .is-hovered.
    //            * Si target ya .is-hovered → quitar (toggle off).
    //            * Si no → clearAll + addHoverIn + setTimeout 2500ms para
    //              auto-quitar.
    //          - Discriminamos touch de mouse via lastPointerType (set por
    //            pointerdown). En mouse click no toggleamos (mouse usa
    //            hover handlers).
    //
    //        Click fuera del SVG (delegado en document) → clearAllHovered.
    //
    //   3. DESTROY — limpia listeners (per-target pointerenter/leave +
    //      svg pointerdown/click + document click) y cualquier setTimeout
    //      pendiente.
    //
    // Reduced-motion:
    //   - paintFinalAll directo en entrada (igual que F1).
    //   - hover orchestrator sigue activo (toggle .is-hovered al hover/tap),
    //     pero el SCSS bajo @include reduced-motion mata transitions y
    //     anula transforms/filters de hover. El dim (opacity 0.55) se
    //     mantiene como feedback visual binario sin transición. Respeta
    //     preferencia sin perder feedback funcional.
    //
    // CSS contract con HTML:
    //   - Cada KPI envuelto en <g class="s_avanzosc_caso_exito_kpi_card">
    //     (3 cards). Bg rect dentro lleva clase `_card_bg` para hover stroke
    //     (aplica solo al rect, no al label/text).
    //   - Bars: 6 <rect class="s_avanzosc_caso_exito_bar">.
    //   - Donut: 1 <path class="s_avanzosc_caso_exito_donut_fill">.
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');
    var countUp = require('website_avanzosc_demo.utils.count_up');

    var IO_THRESHOLD = 0.4;
    var KPI_DURATION_MS = 1500;
    var BAR_DELAY_MS = 400;
    var BAR_STAGGER_MS = 80;
    var DONUT_DELAY_MS = 1100;
    var TOUCH_AUTO_CLEAR_MS = 2500;

    // Selector compuesto para findHoverTarget — los 3 tipos de hover-target
    // dentro del SVG. Concentrado aquí para single-source-of-truth.
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
            // F1 — Entrance animation (paintFinalAll under reduce, IO sequence otherwise)
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
            // F1.1 v2 — Hover orchestrator
            // ============================================================
            var hoverTargets = [];
            for (var bi = 0; bi < bars.length; bi++) hoverTargets.push(bars[bi]);
            if (donut) hoverTargets.push(donut);
            for (var ci = 0; ci < kpiCards.length; ci++) hoverTargets.push(kpiCards[ci]);

            var lastPointerType = 'mouse';
            var touchTimeoutId = null;

            var clearTouchTimeout = function () {
                if (touchTimeoutId) {
                    window.clearTimeout(touchTimeoutId);
                    touchTimeoutId = null;
                }
            };

            var handleHoverIn = function (target) {
                target.classList.add('is-hovered');
                svg.setAttribute('data-hover-active', '');
            };

            var handleHoverOut = function (target) {
                target.classList.remove('is-hovered');
                if (!svg.querySelector('.is-hovered')) {
                    svg.removeAttribute('data-hover-active');
                }
            };

            var clearAllHovered = function () {
                var hovered = svg.querySelectorAll('.is-hovered');
                for (var k = 0; k < hovered.length; k++) {
                    hovered[k].classList.remove('is-hovered');
                }
                svg.removeAttribute('data-hover-active');
                clearTouchTimeout();
            };

            var findHoverTarget = function (node) {
                if (!node || typeof node.closest !== 'function') return null;
                return node.closest(HOVER_TARGET_SELECTOR);
            };

            // pointerenter / pointerleave per target — delegate-not-bubble.
            // pointerenter no bubble (a diferencia de pointerover), así que
            // hay que attach por target. Trade-off aceptable (≤10 listeners).
            var perTargetHandlers = [];
            var makePointerEnter = function (target) {
                return function (e) {
                    if (e.pointerType !== 'mouse') return;
                    if (target.classList.contains('is-hovered')) return;
                    clearAllHovered();
                    handleHoverIn(target);
                };
            };
            var makePointerLeave = function (target) {
                return function (e) {
                    if (e.pointerType !== 'mouse') return;
                    handleHoverOut(target);
                };
            };
            for (var ti = 0; ti < hoverTargets.length; ti++) {
                var target = hoverTargets[ti];
                var enterFn = makePointerEnter(target);
                var leaveFn = makePointerLeave(target);
                target.addEventListener('pointerenter', enterFn);
                target.addEventListener('pointerleave', leaveFn);
                perTargetHandlers.push({ el: target, enter: enterFn, leave: leaveFn });
            }

            // pointerdown delegado al svg → captura último pointerType para
            // discriminar mouse-vs-touch en el click handler subsiguiente.
            var onPointerDown = function (e) {
                lastPointerType = e.pointerType || 'mouse';
            };
            svg.addEventListener('pointerdown', onPointerDown, true);

            // click delegado al svg — toggle táctil. En mouse, los handlers
            // pointerenter/leave ya gestionan el hover; el click adicional
            // se descarta por lastPointerType==='mouse'.
            var onSvgClick = function (e) {
                if (lastPointerType === 'mouse') return;
                var t = findHoverTarget(e.target);
                if (!t) return;
                if (t.classList.contains('is-hovered')) {
                    handleHoverOut(t);
                    clearTouchTimeout();
                } else {
                    clearAllHovered();
                    handleHoverIn(t);
                    clearTouchTimeout();
                    touchTimeoutId = window.setTimeout(function () {
                        handleHoverOut(t);
                        touchTimeoutId = null;
                    }, TOUCH_AUTO_CLEAR_MS);
                }
            };
            svg.addEventListener('click', onSvgClick);

            // click fuera del SVG (en cualquier parte del documento que NO
            // sea descendant del svg) → clearAllHovered. Cubre el caso
            // "tap fuera" en mobile y "click cualquier sitio" en desktop.
            var onDocumentClick = function (e) {
                if (svg.contains(e.target)) return;
                if (svg.querySelector('.is-hovered')) {
                    clearAllHovered();
                }
            };
            document.addEventListener('click', onDocumentClick);

            // Stash refs for destroy.
            this._hoverPerTargetHandlers = perTargetHandlers;
            this._hoverPointerDown = onPointerDown;
            this._hoverSvgClick = onSvgClick;
            this._hoverDocumentClick = onDocumentClick;
            this._hoverSvg = svg;
            this._hoverClearTouchTimeout = clearTouchTimeout;

            return this._super.apply(this, arguments);
        },

        destroy: function () {
            // Hover orchestrator cleanup.
            if (this._hoverPerTargetHandlers) {
                this._hoverPerTargetHandlers.forEach(function (h) {
                    h.el.removeEventListener('pointerenter', h.enter);
                    h.el.removeEventListener('pointerleave', h.leave);
                });
                this._hoverPerTargetHandlers = null;
            }
            if (this._hoverSvg) {
                if (this._hoverPointerDown) {
                    this._hoverSvg.removeEventListener('pointerdown', this._hoverPointerDown, true);
                }
                if (this._hoverSvgClick) {
                    this._hoverSvg.removeEventListener('click', this._hoverSvgClick);
                }
            }
            if (this._hoverDocumentClick) {
                document.removeEventListener('click', this._hoverDocumentClick);
            }
            if (this._hoverClearTouchTimeout) {
                this._hoverClearTouchTimeout();
            }
            return this._super.apply(this, arguments);
        },
    });
});
