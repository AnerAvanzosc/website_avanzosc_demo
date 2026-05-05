odoo.define('website_avanzosc_demo.snippets.timeline', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Snippet `s_avanzosc_timeline` — carrusel scroll-snap horizontal
    // (Pieza D base) + scroll-jacking cinemático con 3 slots (Pieza E v2).
    //
    // Mecánica dual según viewport / motion preference:
    //
    //   - Desktop (>=768px) + motion-on + GSAP/ScrollTrigger cargados:
    //     Pieza E v2. La sección se pinea al entrar viewport. En lugar de
    //     un track contínuo deslizable, el carousel se convierte en un
    //     canvas con 3 slots fijos (left ~18%, center 50%, right ~82%).
    //     Los 8 items pasan a través de los slots: al avanzar el progress,
    //     el item del slot-left sale, los demás avanzan 1 slot, y un nuevo
    //     item entra en slot-right. Slot center es el protagonista (full
    //     scale, color y opacity).
    //
    //     ScrollTrigger.create({pin:true, scrub:1, snap}) pinea la sección
    //     y mapea progress 0→1 a 8 hitos (7 transiciones). En cada
    //     onUpdate, computamos `idx = round(progress * 7)`. Si idx cambió,
    //     llamamos `setActiveTriad(idx)` que aplica las clases CSS de
    //     estado (is-hidden-left/right, is-slot-left/center/right) a cada
    //     item según su distancia al idx activo. Las CSS transitions del
    //     `_timeline.scss` interpolan entre estados (0.5s ease).
    //
    //     NO usamos GSAP timelines per-step: las CSS transitions son
    //     idempotentes (sólo el target final cuenta), por lo que un click
    //     en dot lejano (que dispara varios idx changes durante la 0.6s
    //     de lenis.scrollTo) no produce pile-up — la transición se
    //     redirige al nuevo target en cada cambio. Resultado visual:
    //     coreografía rápida pero coordinada para saltos lejanos, suave
    //     para saltos de 1 hito.
    //
    //   - Mobile (<768px) o reduced-motion o GSAP/ScrollTrigger
    //     unavailable: Pieza D base. Track con scroll-snap CSS x
    //     mandatory. Drag/swipe libre, snap al hito más cercano. Sin
    //     pin, sin slots. La clase `is-st-active` NO se añade.
    //
    // Pieza E v2 lifecycle:
    //   start
    //     ↓
    //   detectar gating (motion + viewport + libs)
    //     ↓
    //   gating ok → crear pinST + class is-st-active
    //              + setActiveTriad(0) para estado inicial
    //              + onUpdate dispara setActiveTriad cuando idx cambia
    //              + click handlers route via lenis.scrollTo
    //   gating ko → fallback Pieza D:
    //              track scroll listener para sync dots
    //              + click handlers route via scrollIntoView
    //
    // setActiveTriad(idx):
    //   For each item N (0..items.length-1):
    //     N <  idx-1     → is-hidden-left
    //     N == idx-1     → is-slot-left
    //     N == idx       → is-slot-center
    //     N == idx+1     → is-slot-right
    //     N >  idx+1     → is-hidden-right
    //   También aplica aria-hidden a items NO en slot-center para que los
    //   screen readers no lean previews laterales redundantes.
    //
    // Edge cases:
    //   - idx=0: slot-left vacío (no item lleva is-slot-left). slot-center
    //     muestra hito 0, slot-right muestra hito 1.
    //   - idx=items.length-1: slot-right vacío. slot-left muestra hito 6,
    //     slot-center muestra hito 7.
    //   - Click dot N lejano: lenis.scrollTo(target, duration: 0.6). Durante
    //     la 0.6s, ScrollTrigger.onUpdate fira con idx incremental
    //     (0→1→2→...→N). Cada cambio dispara setActiveTriad — items
    //     transicionan rápido al estado correspondiente. La sensación es
    //     "fast-forward" pero coordinado, no caótico.
    //
    // Reveal stagger inicial:
    //   gsap.from items con stagger 0.1s expo.out, one-shot al entrar
    //   viewport (IntersectionObserver, no se reanima al swipear).
    //   Independiente del modo Pieza D / E. Reduced-motion skipea.
    //   En modo Pieza E v2, el reveal ocurre antes del pin (mientras la
    //   sección entra al viewport). Cuando el pin engaga, los items ya
    //   están en estado natural, listos para pasar al setActiveTriad(0)
    //   que los acomoda en slots.
    //
    // Lenis ↔ ScrollTrigger contract:
    //   El scroller-proxy se configura en main.js (AvanzoscRoot.start)
    //   tras inicializar Lenis. Aquí asumimos que el bridge ya existe
    //   cuando este widget arranca (orden publicWidget: AvanzoscRoot
    //   matching #wrap se instancia antes que AvanzoscTimeline matching
    //   descendant).
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    var THRESHOLD = 0.3;  // IO para reveal inicial.
    var DESKTOP_MIN = 768;  // Alineado con SCSS @media (max-width: 767.98px).

    publicWidget.registry.AvanzoscTimeline = publicWidget.Widget.extend({
        selector: '.s_avanzosc_timeline',

        start: function () {
            var section = this.el;
            var carousel = section.querySelector('.s_avanzosc_timeline_carousel');
            // `track` = el `<div>` wrapper que tiene overflow-x scroll
            // (no la `<ul>` interna). Recibe role="region" + tabindex y es
            // donde se dispara el scroll event en modo Pieza D. En modo
            // Pieza E el tween de ScrollTrigger escribe a `track.scrollLeft`.
            var track = section.querySelector('.s_avanzosc_timeline_track_wrap');
            var items = section.querySelectorAll('.s_avanzosc_timeline_item');
            var dots = section.querySelectorAll('.s_avanzosc_timeline_dot_indicator');
            var prevArrow = section.querySelector('.s_avanzosc_timeline_arrow--prev');
            var nextArrow = section.querySelector('.s_avanzosc_timeline_arrow--next');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var scrollBehavior = reducedMotion ? 'auto' : 'smooth';

            // -----------------------------------------------------------------
            // Estado y helpers comunes (Pieza D + Pieza E)
            // -----------------------------------------------------------------
            var activeIndex = 0;

            function findCenteredIndex() {
                if (!items.length) return 0;
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
                    dots[newIndex].setAttribute('aria-current', 'true');
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
                setArrowDisabled(nextArrow, idx >= items.length - 1);
            }

            // -----------------------------------------------------------------
            // Pieza E — gating + ScrollTrigger pin/snap
            // -----------------------------------------------------------------
            // Condiciones acumulativas:
            //   1. !reducedMotion (CLAUDE.md §5: opt-out total animations).
            //   2. window.innerWidth >= 768px (mobile táctil mantiene Pieza D
            //      con scroll-snap nativo — más natural en touch UX, evita
            //      hijack del scroll vertical de la página en pantalla
            //      pequeña).
            //   3. window.gsap && window.ScrollTrigger ambos disponibles.
            //   4. items.length > 1 (un único hito no necesita pin).
            // -----------------------------------------------------------------
            var isDesktop = window.innerWidth >= DESKTOP_MIN;
            var hasGsap = typeof window.gsap !== 'undefined';
            var hasScrollTrigger = typeof window.ScrollTrigger !== 'undefined';
            var pinEnabled = !reducedMotion && isDesktop && hasGsap &&
                hasScrollTrigger && track && items.length > 1;

            var pinST = null;

            // -----------------------------------------------------------------
            // setActiveTriad(idx) — Pieza E v2 cinemática
            // -----------------------------------------------------------------
            // Define el estado de slot de cada item según el idx activo.
            // Implementación CSS-class-based: cada item recibe UNA de las 5
            // clases de estado (is-hidden-left, is-slot-left, is-slot-center,
            // is-slot-right, is-hidden-right). Las CSS transitions del SCSS
            // interpolan entre estados (0.5s).
            //
            // aria-hidden: items que NO están en slot-center reciben
            // aria-hidden="true" para que screen readers no lean preview
            // laterales redundantes. Slot-center se ofrece como contenido
            // accesible. Los hitos hidden-left/right ya están fuera del
            // visual flow; aria-hidden los excluye también del flow accesible.
            // -----------------------------------------------------------------
            var STATE_CLASSES = [
                'is-hidden-left',
                'is-slot-left',
                'is-slot-center',
                'is-slot-right',
                'is-hidden-right',
            ];
            function setActiveTriad(idx) {
                if (idx < 0) idx = 0;
                if (idx > items.length - 1) idx = items.length - 1;
                for (var n = 0; n < items.length; n++) {
                    var stateClass;
                    if (n < idx - 1) {
                        stateClass = 'is-hidden-left';
                    } else if (n === idx - 1) {
                        stateClass = 'is-slot-left';
                    } else if (n === idx) {
                        stateClass = 'is-slot-center';
                    } else if (n === idx + 1) {
                        stateClass = 'is-slot-right';
                    } else {
                        stateClass = 'is-hidden-right';
                    }
                    // Toggle: remove all state classes, add the one needed.
                    // classList.remove acepta múltiples args en navegadores
                    // modernos (sin IE).
                    items[n].classList.remove.apply(items[n].classList, STATE_CLASSES);
                    items[n].classList.add(stateClass);
                    // a11y: ocultar al screen reader los items no protagonista.
                    if (stateClass === 'is-slot-center') {
                        items[n].removeAttribute('aria-hidden');
                    } else {
                        items[n].setAttribute('aria-hidden', 'true');
                    }
                }
            }

            if (pinEnabled) {
                // Total scroll distance del pin: 1 viewport-height por hito.
                // Resultado: 7 viewports de scroll para recorrer 8 hitos
                // (~7 wheel ticks fuertes). Es la distancia que el usuario
                // tendrá que rodar la rueda mientras la sección queda fija.
                var totalSteps = items.length - 1;
                var stepDistance = window.innerHeight;
                var totalDistance = totalSteps * stepDistance;

                if (carousel) {
                    carousel.classList.add('is-st-active');
                }

                // Estado inicial — slot-center = item[0], slot-right = item[1],
                // slot-left vacío. Se llama ANTES de crear el trigger para que
                // el primer paint tras is-st-active muestre la triada inicial,
                // sin frame intermedio de items en posición default.
                setActiveTriad(0);
                updateArrowsByIndex(0);

                // ScrollTrigger pin sin animation property — la animación
                // visual la dirige setActiveTriad vía CSS transitions, no un
                // tween GSAP. ScrollTrigger sólo provee progress + snap +
                // pin spacer. onUpdate mapea progress → idx → setActiveTriad.
                //
                // scrub:1 — link 1:1 con scroll progress + 1s de inercia.
                // snap onstep — al soltar el wheel, redirige al hito más
                // cercano con duration 0.4s alineado con la duration de las
                // CSS transitions de los slots.
                pinST = window.ScrollTrigger.create({
                    trigger: section,
                    pin: true,
                    start: 'top top',
                    end: '+=' + totalDistance,
                    scrub: 1,
                    snap: {
                        snapTo: function (value) {
                            return Math.round(value * totalSteps) / totalSteps;
                        },
                        duration: 0.4,
                        ease: 'expo.out',
                    },
                    onUpdate: function (self) {
                        var idx = Math.round(self.progress * totalSteps);
                        if (idx < 0) idx = 0;
                        if (idx > totalSteps) idx = totalSteps;
                        if (idx !== activeIndex) {
                            updateActiveDot(idx);
                            updateArrowsByIndex(idx);
                            setActiveTriad(idx);
                        }
                    },
                });
            } else if (track) {
                // -----------------------------------------------------------------
                // Pieza D — sync dots + arrows con scrollLeft del track
                // -----------------------------------------------------------------
                // rAF-throttled scroll listener. Aplica si NO hay pin ST
                // (mobile, reduced-motion, libs caídas). El track con
                // scroll-snap CSS sigue gestionando swipe/snap; nosotros
                // sólo observamos para sincronizar dots/flechas.
                // -----------------------------------------------------------------
                var syncTicking = false;
                function onScroll() {
                    if (syncTicking) return;
                    syncTicking = true;
                    window.requestAnimationFrame(function () {
                        var idx = findCenteredIndex();
                        updateActiveDot(idx);
                        // updateArrowsByIndex usa el activeIndex recién set
                        // (dentro de updateActiveDot). Lo llamamos después.
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

            // -----------------------------------------------------------------
            // Click handlers — dots y flechas, con routing dual
            // -----------------------------------------------------------------
            // Pieza E mode: target hito N → page-scroll position dentro del
            // pin range → lenis.scrollTo(pageScroll). Lenis scrollea wrapwrap,
            // scroller-proxy notifica a ScrollTrigger, ScrollTrigger.update
            // mueve el tween, scrollLeft del track avanza. Cadena coherente.
            //
            // Pieza D mode: scrollIntoView({inline:'center'}) — directo
            // sobre el item del track, fallback nativo.
            // -----------------------------------------------------------------
            function gotoHito(idx) {
                if (idx < 0) idx = 0;
                if (idx > items.length - 1) idx = items.length - 1;
                if (pinST && window.lenis) {
                    var progress = items.length > 1 ? idx / (items.length - 1) : 0;
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

            // -----------------------------------------------------------------
            // Reveal stagger inicial — patrón existente (Task 3.8 audit 8.1).
            // One-shot por IO; NO se reanima al swipear. Sólo aplica si GSAP
            // disponible y reduced-motion no activado. Independiente del modo
            // Pieza D / E.
            //
            // Caveat Pieza E: si el pin está activo, los items se animan
            // gsap.from(opacity 0, y 20) → estado natural. El stagger se
            // dispara al entrar la sección al viewport (IO 30%). Cuando
            // ScrollTrigger empieza a pinear (start: top top), el reveal ya
            // ha terminado (los items están en estado natural); no hay
            // conflicto entre los dos animations.
            // -----------------------------------------------------------------
            if (reducedMotion) {
                return this._super.apply(this, arguments);
            }
            if (!hasGsap) {
                console.warn('[website_avanzosc_demo] GSAP not loaded, timeline reveal skipped');
                return this._super.apply(this, arguments);
            }

            // Pieza E v2: si pinEnabled, el reveal stagger no aplica — los
            // items son posicionados absolute con opacity:0 default, y la
            // visibilidad la dirige setActiveTriad mediante clases de estado
            // (is-slot-center con opacity:1). Si gsap.from() corriera, dejaría
            // inline styles `opacity:X` que sobrescribirían las clases CSS
            // (specificity 1,0,0 inline > 0,0,3,0 selector). Skip clean.
            //
            // Modo Pieza D (mobile / reduced-motion / libs caídas): reveal
            // stagger sigue válido, los items son flex con scroll-snap visible
            // desde el principio.
            if (pinEnabled) {
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
                        observer.unobserve(section);
                    }
                });
            }, { threshold: THRESHOLD });

            observer.observe(section);

            return this._super.apply(this, arguments);
        },
    });
});
