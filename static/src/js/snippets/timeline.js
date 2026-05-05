odoo.define('website_avanzosc_demo.snippets.timeline', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Snippet `s_avanzosc_timeline` — Pieza D base + Pieza E v3 (approach H).
    //
    // Mecánica dual:
    //
    //   - Pieza D base (mobile / reduced-motion / GSAP+ScrollTrigger
    //     ausentes): track con scroll-snap CSS x mandatory. Drag/swipe
    //     libre + dots indicators + flechas prev/next. Sin pin, sin
    //     wheel intercept. JS solo sincroniza dots/flechas con el
    //     scrollLeft del track via rAF-throttled listener.
    //
    //   - Pieza E v3 (desktop ≥768 + motion-on + gsap+ScrollTrigger):
    //     ScrollTrigger pin + scrub:1 SIN snap. La sección se pinea al
    //     entrar viewport. onUpdate aplica inline styles continuos a
    //     cada item en función del progress (0..1).
    //
    //     Approach H elimina las idx changes discretas que causaban
    //     ghost en D28 (cadencia 30-200ms vs duración transition 0.5s):
    //     no hay clases is-slot-* discretas; cada item es animado
    //     continuamente. Sin transition CSS sobre las propiedades
    //     animadas — JS provee el flujo a 60fps.
    //
    //     Mapping `progress` → estilos inline per-item:
    //
    //       effectiveIdx = progress * (N-1)         // float continuous
    //       For each item i:
    //         delta = i - effectiveIdx             // signed distance
    //         absDelta = |delta|
    //         left%    = 50 + delta * 32           // anclas: -1→18%, 0→50%, +1→82%
    //         scale    = 1.0 - 0.20 * min(absDelta, 1)
    //                                              // 0→1.0, ±1+→0.80
    //         opacity  = clamp(1.0 - max(0, absDelta - 1), 0, 1)
    //                                              // [0,1]→1.0, [1,2]→fade, ≥2→0
    //         width%   = 36 - 14 * min(absDelta, 1)
    //                                              // 0→36%, ±1+→22%
    //         zIndex   = 100 - round(absDelta * 10)
    //         color    = lerp(neutral-900, neutral-500, min(absDelta, 1))
    //                                              // continuous neutral fade
    //
    //     Progress fill bar (Approach A): el JS también actualiza una
    //     CSS variable `--progress-fill` en el carousel con el progress
    //     en %, que alimenta el linear-gradient del ::before (línea
    //     conectora a top:82%). Resultado: la línea se rellena izq→der
    //     en brand-primary proporcional al scroll.
    //
    //     Para el slot center virtual (sólo afecta dots indicator UI,
    //     no estilos inline): idx = round(effectiveIdx). Cuando idx
    //     cambia (~7 veces por scroll completo), updateActiveDot +
    //     updateArrowsByIndex. Sin classList changes durante scrub
    //     sobre items.
    //
    // Justificación técnica de las curvas (no instrucción explícita):
    //
    //   - left mapping linear: brief pide "items animados continuamente
    //     con progress 0..1". Lineal es la curva más natural y más
    //     predecible — coincidencia exacta con las anclas D28
    //     (left/center/right en 18/50/82%) en delta -1/0/+1.
    //   - scale piecewise linear con saturación en |delta|=1 (0.20 *
    //     clamp): brief post-validación pidió "scale más agresivo"
    //     para reforzar adyacentes "pierden fuerza". Center 1.0,
    //     ±1+ saturado a 0.80 (vs 0.85 anterior, vs 0.70 saturado a
    //     |delta|=2 de la versión original con 0.15*min(|delta|,2)).
    //   - opacity solo fade en [1, 2]: del slot lateral (1) al hidden
    //     (2). En [0, 1] opacity siempre 1.0 — los slots laterales
    //     son legibles (axe-core opacity gotcha cubierto por color
    //     sin opacity). Hidden solo cuando |delta| ≥ 2 (fuera del
    //     rango visible left/center/right).
    //   - width como función separada: aunque transform:scale ya
    //     escala visualmente el item, width controla el espacio que
    //     ocupa el bloque (relevante para text wrapping). 36→22% es
    //     la transición suave del protagonista al preview.
    //   - z-index round(absDelta * 10): items más cercanos al centro
    //     pintan encima. Continuous range 100..70 evita stacking
    //     issues.
    //   - color lerp neutral-900 → neutral-500 (#646C75 post-B3
    //     darkened, ratio 5.3:1 vs blanco — pasa WCAG AA): saturado
    //     en |delta|=1 igual que scale. Endpoint mantiene AA por
    //     margen razonable. Center texto color full neutral-900
    //     (10.5:1). Year keeps brand-primary (decisión: brand
    //     recognition + scope-keep G3 deferred-brand-primary-contrast).
    //
    // Click handlers (dots/flechas):
    //   - Pieza E v3: lenis.scrollTo a posición pin del idx target.
    //     duration 0.6s. Single-shot snap discreto sólo en click.
    //   - Pieza D base: scrollIntoView({inline:'center'}) sobre el item.
    //
    // Lifecycle:
    //   start  → gating
    //          → pinEnabled true:  añade is-st-active, inicializa estado,
    //                              crea ScrollTrigger pin + scrub.
    //          → pinEnabled false: track scroll listener D base.
    //          → click handlers comunes.
    //          → resize listener (ScrollTrigger.refresh).
    //   destroy → kill pinST + remove listeners.
    //
    // Reveal stagger inicial (Task 3.8 heredado):
    //   - pinEnabled true: SKIP. Los items ya viven en estado natural
    //     pre-pin; el flujo del scrub provee la animación.
    //   - pinEnabled false: gsap.from stagger sobre items, IO 30%, una
    //     vez al entrar viewport.
    //
    // Lenis ↔ ScrollTrigger contract:
    //   El scroller-proxy + bridge lenis.on('scroll', ScrollTrigger.update)
    //   se configuran en main.js (AvanzoscRoot.start). Aquí asumimos que
    //   el bridge ya existe cuando este widget arranca (publicWidget
    //   ordering: AvanzoscRoot matching #wrap se instancia antes que
    //   AvanzoscTimeline matching descendant).
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    var IO_THRESHOLD = 0.3;          // Fallback reveal stagger threshold.
    var DESKTOP_MIN = 768;           // Alineado con SCSS @media.
    var SCRUB_PIN_VH = 1.0;          // Viewport heights por hito durante el pin.

    publicWidget.registry.AvanzoscTimeline = publicWidget.Widget.extend({
        selector: '.s_avanzosc_timeline',

        start: function () {
            var section = this.el;
            var carousel = section.querySelector('.s_avanzosc_timeline_carousel');
            var track = section.querySelector('.s_avanzosc_timeline_track_wrap');
            var items = section.querySelectorAll('.s_avanzosc_timeline_item');
            var dots = section.querySelectorAll('.s_avanzosc_timeline_dot_indicator');
            var milestoneDots = section.querySelectorAll('.s_avanzosc_timeline_milestone_dot');
            var prevArrow = section.querySelector('.s_avanzosc_timeline_arrow--prev');
            var nextArrow = section.querySelector('.s_avanzosc_timeline_arrow--next');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var scrollBehavior = reducedMotion ? 'auto' : 'smooth';

            // ----- Estado compartido (Pieza D + Pieza E) -----
            var activeIndex = 0;
            var totalSteps = items.length - 1;

            function findCenteredIndex() {
                if (!items.length || !track) return 0;
                var trackRect = track.getBoundingClientRect();
                var trackCenter = trackRect.left + trackRect.width / 2;
                var bestIndex = 0;
                var bestDistance = Infinity;
                for (var i = 0; i < items.length; i++) {
                    var itemRect = items[i].getBoundingClientRect();
                    var itemCenter = itemRect.left + itemRect.width / 2;
                    var distance = Math.abs(itemCenter - trackCenter);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestIndex = i;
                    }
                }
                return bestIndex;
            }

            function updateActiveDot(newIndex) {
                if (newIndex === activeIndex) return;
                if (dots[activeIndex]) {
                    dots[activeIndex].classList.remove('is-active');
                    dots[activeIndex].removeAttribute('aria-current');
                }
                if (dots[newIndex]) {
                    dots[newIndex].classList.add('is-active');
                    dots[newIndex].setAttribute('aria-current', 'step');
                }
                activeIndex = newIndex;
            }

            function setArrowDisabled(arrow, disabled) {
                if (!arrow) return;
                if (disabled) {
                    arrow.setAttribute('disabled', 'disabled');
                } else {
                    arrow.removeAttribute('disabled');
                }
            }

            function updateArrowsByIndex(idx) {
                setArrowDisabled(prevArrow, idx <= 0);
                setArrowDisabled(nextArrow, idx >= totalSteps);
            }

            // ----- Pieza E v3 gating -----
            var isDesktop = window.innerWidth >= DESKTOP_MIN;
            var hasGsap = typeof window.gsap !== 'undefined';
            var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
            var pinEnabled = !reducedMotion && isDesktop && hasGsap &&
                hasScrollTrigger && track && items.length > 1;

            var pinST = null;
            var resizeHandler = null;

            // ----- Color lerp endpoints (Pieza E v3 ajuste) -----
            // Interpolación continua del color del texto del item entre
            // `--neutral-900` (#0F1419, center protagonista) y
            // `--neutral-500` (#646C75, slot lateral pierde fuerza).
            // El endpoint `--neutral-500` ya quedó darkened a #646C75 en
            // Sprint B3 con ratio efectivo ~5.3:1 sobre fondo blanco —
            // pasa WCAG AA (≥4.5:1) por margen razonable. El gotcha 14
            // (axe-core factoriza opacity) se cubre porque opacity de
            // los items en [0,1] se mantiene plana = 1.0 — la atenuación
            // visual la dirige el color rgb interpolado, no opacity.
            var COLOR_CENTER_RGB = [15, 20, 25];     // #0F1419 = neutral-900
            var COLOR_EDGE_RGB = [100, 108, 117];    // #646C75 = neutral-500 (post-B3)
            function lerpColor(t) {
                if (t < 0) t = 0;
                if (t > 1) t = 1;
                var r = Math.round(COLOR_CENTER_RGB[0] + (COLOR_EDGE_RGB[0] - COLOR_CENTER_RGB[0]) * t);
                var g = Math.round(COLOR_CENTER_RGB[1] + (COLOR_EDGE_RGB[1] - COLOR_CENTER_RGB[1]) * t);
                var b = Math.round(COLOR_CENTER_RGB[2] + (COLOR_EDGE_RGB[2] - COLOR_CENTER_RGB[2]) * t);
                return 'rgb(' + r + ', ' + g + ', ' + b + ')';
            }

            // ----- updateScrub(progress) — Pieza E v3 cinemática continua -----
            // Aplica inline styles a cada item en función del progress (0..1).
            // Llamada desde ScrollTrigger.onUpdate (no rAF-throttle adicional;
            // ScrollTrigger ya throttle internamente al 60fps del raf).
            //
            // Progress fill (Approach A, ajuste post-validación):
            //   carousel.style.--progress-fill = (progress*100)% — alimenta
            //   el linear-gradient del pseudo-elemento ::before. Stop dinámico
            //   izq→der: brand-primary 0%..fill%, neutral-300 fill%..100%.
            //
            // Scale más agresivo (ajuste post-validación):
            //   1.0 - 0.20 * min(|delta|, 1) — center 1.0, ±1+ saturado a
            //   0.80 (vs 0.85 anterior). Saturación en |delta|≥1, no ≥2.
            //   Hace los adyacentes más perceptiblemente "pequeños".
            //
            // Color text continuous lerp:
            //   t = min(|delta|, 1) → lerpColor(t) entre neutral-900 y
            //   neutral-500. Aplicado al item parent; title/desc heredan
            //   por `color: inherit` en SCSS .is-st-active. Year mantiene
            //   brand-primary (decisión: brand recognition + scope-keep
            //   sobre G3 brand-primary contrast).
            // -----------------------------------------------------------------
            function updateScrub(progress) {
                var effectiveIdx = progress * totalSteps;  // continuous float [0, totalSteps]

                if (carousel) {
                    carousel.style.setProperty('--progress-fill', (progress * 100).toFixed(2) + '%');
                }

                for (var i = 0; i < items.length; i++) {
                    var delta = i - effectiveIdx;
                    var absDelta = Math.abs(delta);

                    var leftPct = 50 + delta * 32;                          // anclas -1→18, 0→50, +1→82
                    var scale = 1.0 - 0.20 * Math.min(absDelta, 1);          // 0→1.0, ±1+→0.80
                    var opacity = 1.0 - Math.max(0, absDelta - 1);
                    if (opacity < 0) opacity = 0;
                    if (opacity > 1) opacity = 1;
                    var widthPct = 36 - 14 * Math.min(absDelta, 1);          // 0→36, ±1+→22
                    var zIndex = 100 - Math.round(absDelta * 10);
                    // Color lerp solo en rango slot (opacity == 1). En fade-out
                    // (opacity < 1) revertir a neutral-900: el lerp endpoint
                    // (#646C75) compuesto con opacity 0.5 produce blend
                    // ≈ #b2b6ba (2.04:1 en axe, vs 3.6:1 con neutral-900 puro).
                    // Mantenemos magnitud pre-amend en fade-out (gotcha 14
                    // físicamente impide AA con opacity < 1 sobre fondo blanco;
                    // ese fail es estructural del effect, no del lerp).
                    var colorT = (opacity >= 1.0) ? Math.min(absDelta, 1) : 0;

                    var item = items[i];
                    item.style.left = leftPct.toFixed(2) + '%';
                    item.style.transform = 'translate(-50%, -50%) scale(' + scale.toFixed(3) + ')';
                    item.style.opacity = opacity.toFixed(3);
                    item.style.width = widthPct.toFixed(2) + '%';
                    item.style.zIndex = String(zIndex);
                    item.style.color = lerpColor(colorT);

                    // aria-hidden gating en rango fade-out (|delta|>1, opacity<1):
                    // exclusión de screen readers para items que están saliendo
                    // del viewport. Slot-active items (opacity 1) permanecen
                    // accesibles. Nota: axe-core 4.x NO honra aria-hidden para
                    // color-contrast checks (verifica todos los elementos
                    // visibles); el fail en fade-range es estructural por gotcha
                    // 14 (opacity < 1 sobre blanco no puede pasar AA), aceptado
                    // — magnitud equivalente al baseline pre-amend.
                    if (opacity < 1.0) {
                        item.setAttribute('aria-hidden', 'true');
                    } else {
                        item.removeAttribute('aria-hidden');
                    }
                }

                // Milestone dots — toggle is-passed cuando progress cruza
                // el threshold del dot (idx / totalSteps). Idempotente: el
                // toggle al mismo state es no-op (classList.toggle con
                // segundo arg booleano). Transition CSS 200ms suaviza el
                // cambio. Wheel rápido reverso (toggle on→off→on) genera
                // re-trigger de transition pero sin flicker porque la
                // transition redirige al target final dentro del mismo
                // 200ms (similar al diseño aproach H sobre items).
                for (var d = 0; d < milestoneDots.length; d++) {
                    var threshold = totalSteps > 0 ? d / totalSteps : 0;
                    milestoneDots[d].classList.toggle('is-passed', progress >= threshold);
                }

                // Discrete idx tracking — solo para dots indicator UI.
                var idx = Math.round(effectiveIdx);
                if (idx < 0) idx = 0;
                if (idx > totalSteps) idx = totalSteps;
                if (idx !== activeIndex) {
                    updateActiveDot(idx);
                    updateArrowsByIndex(idx);
                }
            }

            if (pinEnabled) {
                if (carousel) carousel.classList.add('is-st-active');

                // Estado inicial — progress 0, item 0 al center, item 1 al
                // right slot. Llamada antes de crear el trigger para que el
                // primer paint tras is-st-active muestre la triada inicial.
                updateScrub(0);
                updateArrowsByIndex(0);

                var totalDistance = totalSteps * SCRUB_PIN_VH * window.innerHeight;

                pinST = window.ScrollTrigger.create({
                    trigger: section,
                    pin: true,
                    start: 'top top',
                    end: '+=' + totalDistance,
                    scrub: 1,
                    // SIN snap — approach H. La animación es continua.
                    onUpdate: function (self) {
                        updateScrub(self.progress);
                    },
                });

                // Resize: recomputa pin distance + posiciones de items.
                resizeHandler = function () {
                    if (pinST) pinST.refresh();
                };
                window.addEventListener('resize', resizeHandler);
            } else if (track) {
                // ----- Pieza D base — sync dots/flechas con scrollLeft -----
                var syncTicking = false;
                function onScroll() {
                    if (syncTicking) return;
                    syncTicking = true;
                    window.requestAnimationFrame(function () {
                        var idx = findCenteredIndex();
                        updateActiveDot(idx);
                        updateArrowsByIndex(activeIndex);
                        syncTicking = false;
                    });
                }
                track.addEventListener('scroll', onScroll, { passive: true });
                window.requestAnimationFrame(function () {
                    var idx = findCenteredIndex();
                    updateActiveDot(idx);
                    updateArrowsByIndex(activeIndex);
                });
            }

            // ----- Click handlers — dots y flechas, routing dual -----
            function gotoHito(idx) {
                if (idx < 0) idx = 0;
                if (idx > totalSteps) idx = totalSteps;
                if (pinST && window.lenis) {
                    var progress = totalSteps > 0 ? idx / totalSteps : 0;
                    var targetScroll = pinST.start +
                        progress * (pinST.end - pinST.start);
                    window.lenis.scrollTo(targetScroll, { duration: 0.6 });
                } else if (items[idx]) {
                    items[idx].scrollIntoView({
                        behavior: scrollBehavior,
                        inline: 'center',
                        block: 'nearest',
                    });
                }
            }

            for (var i = 0; i < dots.length; i++) {
                (function (dot) {
                    dot.addEventListener('click', function () {
                        var idx = parseInt(dot.getAttribute('data-target-index'), 10);
                        if (isNaN(idx)) return;
                        gotoHito(idx);
                    });
                })(dots[i]);
            }

            if (prevArrow) {
                prevArrow.addEventListener('click', function () {
                    gotoHito(activeIndex - 1);
                });
            }
            if (nextArrow) {
                nextArrow.addEventListener('click', function () {
                    gotoHito(activeIndex + 1);
                });
            }

            // ----- Reveal stagger inicial — solo si NO pinEnabled -----
            // En modo Pieza E v3 los items se animan continuamente desde
            // updateScrub(0); un gsap.from() previo dejaría inline styles
            // residuales que ganarían por specificity sobre los inline que
            // updateScrub aplica (gsap.from inline styles gotcha — D28).
            // Skip clean cuando pinEnabled.
            // En modo Pieza D base se mantiene el reveal stagger original
            // (Task 3.8) para entrada coreografiada de los 8 items.
            if (reducedMotion || pinEnabled || !hasGsap) {
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
                reveal();
                return this._super.apply(this, arguments);
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        reveal();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: IO_THRESHOLD });
            observer.observe(section);

            // Stash refs for destroy.
            this._pinST = pinST;
            this._resizeHandler = resizeHandler;

            return this._super.apply(this, arguments);
        },

        destroy: function () {
            if (this._pinST) {
                this._pinST.kill();
                this._pinST = null;
            }
            if (this._resizeHandler) {
                window.removeEventListener('resize', this._resizeHandler);
                this._resizeHandler = null;
            }
            return this._super.apply(this, arguments);
        },
    });
});
