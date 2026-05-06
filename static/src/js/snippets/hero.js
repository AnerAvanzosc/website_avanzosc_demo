odoo.define('website_avanzosc_demo.snippets.hero', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Snippet `s_avanzosc_hero` — orquestación entrada con Splitting.js +
    // GSAP timeline (Task 3.10). La animación estrella de Phase 3.
    //
    // Patrón:
    //   1. Splitting.js wrapea cada char del claim H1 en `<span class="char">`
    //      con `--char-index` CSS custom prop por char.
    //   2. GSAP timeline orquestada:
    //      a. Claim chars: opacity 0→1 + y 20→0, duration 0.4s, stagger
    //         0.025s, ease expo.out. Total ≈ 1.3s para 38 chars del claim
    //         «Odoo industrial de verdad, desde 2008.» (37 chars + 38º
    //         que es el `.`). El plan §9.2 menciona «total ≤800ms» pero
    //         con 30ms stagger × 38 chars + 800ms duration daría ~1.9s;
    //         compromise stagger 25ms + duration 0.4 = ~1.3s, mantiene
    //         feel letter-by-letter sin extender demasiado el primer paint.
    //      b. Subtítulo: opacity 0→1 + y 12→0, duration 0.3s, delay 0.6s
    //         (entra cuando el claim casi termina su primer 50%).
    //      c. CTAs: opacity 0→1, duration 0.3s, delay 0.9s.
    //   3. Trigger al cargar (no scroll-trigger): el hero ES el primer
    //      viewport, ya está visible al render.
    //
    // Reduced-motion:
    //   No se ejecuta Splitting NI gsap timeline. El SCSS @include
    //   reduced-motion fuerza opacity 1 + transform identity en
    //   claim/subtitle/actions (y en .char si existe). Estado final
    //   directo sin ninguna animación.
    //
    // Fallbacks defensivos:
    //   - Splitting no cargado (CDN failure): NO ejecuta gsap.set/from
    //     sobre chars; en su lugar fade del claim entero.
    //   - GSAP no cargado (CDN failure): no-op; los elementos se quedan
    //     en estado CSS hidden (opacity 0). El usuario verá el hero vacío
    //     hasta que GSAP cargue. Trade-off aceptable: GSAP es CDN
    //     prerrequisito declarado en assets.xml head.
    //
    // Coordinación con Splitting.js CSS (head_external_assets):
    //   El stylesheet de Splitting (cargado en <head>) define `.char`,
    //   `.word`, `.whitespace` con `display: inline-block` etc. Nuestro
    //   _hero.scss reafirma `.char { display: inline-block; opacity: 0;
    //   transform: translateY(20px) }` para tener el initial state
    //   localmente sin depender exclusivamente del CSS externo.
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscHero = publicWidget.Widget.extend({
        selector: '.s_avanzosc_hero',

        start: function () {
            var section = this.el;
            var claim = section.querySelector('.s_avanzosc_hero_claim');
            var subtitle = section.querySelector('.s_avanzosc_hero_subtitle');
            var actions = section.querySelector('.s_avanzosc_hero_actions');
            // Pieza A — refs a los 3 layers de decoración (CSS grid + SVG
            // lines + HTML annotations container v3).
            var gridLayer = section.querySelector('.s_avanzosc_hero_grid');
            var linesLayer = section.querySelector('.s_avanzosc_hero_lines');
            var annotationsLayer = section.querySelector('.s_avanzosc_hero_annotations');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (reducedMotion) {
                // SCSS @include reduced-motion fuerza visibility (incl. layers
                // Pieza A en estado final); nada que hacer.
                return this._super.apply(this, arguments);
            }

            // Pieza A — Parallax: vanilla scroll listener + rAF debounce.
            // Razón de NO usar GSAP ScrollTrigger: timeline.js (Task 3.8)
            // documenta explícitamente que ScrollTrigger requiere
            // scroller-proxy + sync con Lenis (~30 líneas integración) para
            // funcionar correctamente en el `#wrapwrap` de Odoo. Escoger
            // IO-style o vanilla scroll fue la decisión del módulo. Para
            // parallax continuo (no one-shot) IO no aplica (no da progreso
            // continuo); vanilla scroll + rAF es el patrón nativo
            // equivalente, 10 líneas, sin scope expansion ni dependencia
            // adicional. El plugin ScrollTrigger fue cargado pre-existente
            // en assets.xml hasta que se retiró (2026-05-04) al confirmar
            // 0 uso real — ahora ya no está en el bundle.
            //
            // Mecánica: al scrollear, leemos rect.top del hero relativo al
            // viewport, computamos progress 0→1 (0 = hero en top viewport,
            // 1 = hero scrolleado completo fuera del viewport por arriba),
            // y aplicamos translate3d a los 2 layers. translate3d (no
            // translate Y simple) fuerza GPU layer composition, manteniendo
            // 60fps incluso con muchos elementos del hero animando.
            //
            // Scroll target: en Odoo 14 con Lenis configurado en main.js
            // (`wrapper: wrapwrap, content: wrapwrap`), el elemento que
            // realmente scrollea es `#wrapwrap`, NO `window`. Los scroll
            // events `window.addEventListener('scroll', …)` NO disparan
            // bajo este setup (verificado empíricamente sesión 2026-05-04).
            // El listener correcto va en `#wrapwrap`. Sin Lenis (e.g.,
            // reduced-motion donde main.js no instancia Lenis) `#wrapwrap`
            // sigue siendo el scrollable element del shell de Odoo, así
            // que el listener funciona universalmente.
            // -----------------------------------------------------------------
            var scrollTarget = document.getElementById('wrapwrap') || window;
            var parallaxTicking = false;
            // Pieza A v2 — refactor: el transform de las capas decorativas
            // se compone en SCSS desde 3 CSS vars (--scroll-y, --mouse-rx,
            // --mouse-ry). Cada listener actualiza solo la suya; CSS combina
            // todas en un único `transform: translate3d(...) rotateX(...)
            // rotateY(...)`. Sin esto, el inline `style.transform` del
            // scroll parallax y del mouse parallax se sobrescribirían
            // mutuamente. CSS vars son la coexistencia limpia.
            function applyParallax() {
                var rect = section.getBoundingClientRect();
                // progress 0→1 mientras el hero sale del viewport por arriba.
                var heroHeight = rect.height || 1;
                var progress = Math.max(0, Math.min(1, -rect.top / heroHeight));
                // Líneas: -15% al fully scrolled past, dots: -5% (más lento atrás).
                if (linesLayer) {
                    linesLayer.style.setProperty('--scroll-y', (progress * -15) + '%');
                }
                if (gridLayer) {
                    gridLayer.style.setProperty('--scroll-y', (progress * -5) + '%');
                }
                // Pieza A v3 — annotations en misma capa de profundidad que
                // lines (-15%) per spec.
                if (annotationsLayer) {
                    annotationsLayer.style.setProperty('--scroll-y', (progress * -15) + '%');
                }
                parallaxTicking = false;
            }
            function onScroll() {
                if (!parallaxTicking) {
                    window.requestAnimationFrame(applyParallax);
                    parallaxTicking = true;
                }
            }
            scrollTarget.addEventListener('scroll', onScroll, { passive: true });
            // Apply once at init (hero may not be at viewport top on hard reload).
            applyParallax();

            if (typeof window.gsap === 'undefined') {
                console.warn('[website_avanzosc_demo] GSAP not loaded, hero animation skipped');
                // Sin GSAP: revertir a estado visible para no dejar el hero hidden.
                if (claim) claim.style.opacity = '1';
                if (subtitle) {
                    subtitle.style.opacity = '1';
                    subtitle.style.transform = 'none';
                }
                if (actions) actions.style.opacity = '1';
                // Pieza A — sin GSAP igual revelamos la decoración para no
                // dejar el hero pelado. El SCSS transition cubre el fade-in
                // suave; el listener de scroll para parallax sigue activo
                // (no depende de GSAP).
                section.classList.add('is-decoration-revealed');
                return this._super.apply(this, arguments);
            }

            var gsap = window.gsap;

            // Splitting.js letter-split del claim. Sólo si la lib cargó
            // correctamente desde la CDN.
            var hasSplitting = typeof window.Splitting === 'function' && claim;
            if (hasSplitting) {
                window.Splitting({ target: claim, by: 'chars' });
            }

            // Restaurar opacity del claim padre (estaba en 0 vía SCSS).
            // Los chars individuales (post-Splitting) se animan; si Splitting
            // no corrió, animamos el claim entero.
            gsap.set(claim, { opacity: 1 });

            // Pieza A — Disparar el fade-in de la decoración SIMULTÁNEO al
            // arranque del letter-stagger (no antes, no después). El SCSS
            // tiene transition: opacity 600ms cubic-bezier ya configurado;
            // toggle de la clase activa el reveal. Coordinar con el inicio
            // del letter-stagger (no con su fin) preserva la sensación del
            // claim como protagonista — la atmósfera aparece en el mismo
            // momento del «arrival».
            section.classList.add('is-decoration-revealed');

            var tl = gsap.timeline();

            // NOTA: usamos gsap.to() (no gsap.from) porque el SCSS define
            // el initial state hidden (opacity:0 + translateY) sobre los
            // 3 elementos. gsap.from() animaría FROM hidden TO el state
            // natural CSS — pero el state natural es ya hidden vía nuestro
            // SCSS, así que la animación sería no-op (queda invisible).
            // gsap.to() anima FROM el state actual (hidden via CSS) TO el
            // state final visible especificado en el args. Patrón coherente
            // con el resto de Phase 3 (pilares, sectores, etc. que usan
            // class-toggle CSS-only).
            // Audit 8.1 (sesión 2026-04-29 vs spec §9.2):
            //   - claim chars duration 400ms → dentro 300-600ms micro.
            //   - claim fallback duration 600ms → techo del rango micro.
            //   - subtítulo + CTAs duration 300ms → suelo del rango micro.
            //   - escena total ≈ 1300ms (claim 400 + 25ms × 38 chars + delays
            //     hasta 900ms para CTAs) → ~100ms por encima del techo de
            //     entradas grandes (800-1200ms). Aceptable: la entrada
            //     orquestada del hero es el «moment of arrival» del sitio
            //     (CLAUDE.md §5 patrones aprobados); compromise stagger 25ms
            //     vs 30ms ya documentado en docstring superior — mantiene
            //     impacto sin volverse tedioso.
            //   - ease expo.out coincide con cubic-bezier(0.16, 1, 0.3, 1).
            if (hasSplitting) {
                var chars = claim.querySelectorAll('.char');
                if (chars.length > 0) {
                    tl.to(chars, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.025,
                        ease: 'expo.out',
                    });
                }
            } else {
                // Fallback sin Splitting: animar el claim entero.
                tl.to(claim, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'expo.out',
                });
            }

            // Subtítulo: entra cuando el claim casi termina (delay absoluto 0.6s).
            if (subtitle) {
                tl.to(subtitle, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'expo.out',
                }, 0.6);
            }

            // CTAs: entran tras el subtítulo (delay absoluto 0.9s).
            if (actions) {
                tl.to(actions, {
                    opacity: 1,
                    duration: 0.3,
                    ease: 'expo.out',
                }, 0.9);
            }

            // -------------------------------------------------------------
            // Pieza A v2 — Mouse reactivity 3D + glow zonal sobre paths
            // -------------------------------------------------------------
            // Activación: solo desktop ≥992px (Bootstrap `lg`, alineado con
            // breakpoints existentes del módulo). Mobile <992px y reduced-
            // motion se quedan con parallax scroll vanilla + animación de
            // entrada actuales — la rama reduced-motion ya hizo early return
            // arriba. Para mobile, simplemente NO se enganchan listeners.
            //
            // Defaults técnicos:
            //   ROTATE_MAX_GRID  = 5.0 deg — capa "más lejana".
            //   ROTATE_MAX_LINES = 10.0 deg — capa "más cerca", magnitud 2x
            //                                grid (ratio 2:1 mantenido).
            //                                Subido desde 1.5/3.0 (imperceptible
            //                                en uso real) tras feedback humano
            //                                post-validación commit c3e8774.
            //   PERSPECTIVE      = 1000 px (en SCSS sobre la section).
            //   LERP             = 0.10 — damping por frame del current al
            //                              target. Sin lerp = jitter cuando
            //                              el mousemove llega más rápido que
            //                              el rAF.
            //
            // Coexistencia con scroll parallax: ambos escriben CSS vars
            // independientes (--scroll-y vs --mouse-rx/-ry). SCSS combina.
            //
            // Lerp loop: rAF cascade activo solo cuando hay diferencia
            // current↔target. Cuando converge a target=0 + current≈0
            // (mouseleave settled), se detiene para no consumir CPU.
            //
            // Glow zona-cuadrante: dividir hero en 3 zonas según posiciones
            // groseras de los 3 paths del SVG (viewBox 0..100):
            //   - main path: M -2 78 → 102 72 (curva inferior horizontal).
            //   - secondary topright: M 95 8 → 70 28 (diagonal arriba-der).
            //   - secondary topleft: M -2 25 → 18 18 (diagonal arriba-izq).
            // Decisión: dividir por (nx, ny) normalizadas en hero rect:
            //   ny > 0.5            → main (zona inferior, todo el ancho).
            //   ny ≤ 0.5 && nx ≤ 0.5 → secondary topleft.
            //   ny ≤ 0.5 && nx > 0.5 → secondary topright.
            // Más simple que bounding box per-path (que requeriría
            // getBBox + transform inverse para mapear viewBox a viewport)
            // y suficiente: cada zona contiene a su path natural.
            // -------------------------------------------------------------
            var DESKTOP_MIN = 992;
            var enableMouseReactivity = window.innerWidth >= DESKTOP_MIN;
            if (!enableMouseReactivity) {
                return this._super.apply(this, arguments);
            }

            var ROTATE_MAX_GRID = 5.0;
            var ROTATE_MAX_LINES = 10.0;
            var LERP = 0.10;

            var mainPath = section.querySelector('.s_avanzosc_hero_lines_main');
            var topleftPath = section.querySelector('.s_avanzosc_hero_lines_secondary_topleft');
            var toprightPath = section.querySelector(
                '.s_avanzosc_hero_lines_secondary:not(.s_avanzosc_hero_lines_secondary_topleft)'
            );

            // currentRX/RY normalized en [-1, +1] (sin grados); al apply,
            // multiplicamos por ROTATE_MAX_GRID|LINES per layer.
            var targetRX = 0, targetRY = 0;
            var currentRX = 0, currentRY = 0;
            var rafActive = false;
            var activePath = null;

            function pickActivePath(nx, ny) {
                if (ny > 0.5) return mainPath;
                return nx <= 0.5 ? topleftPath : toprightPath;
            }
            function setGlow(p) {
                if (activePath === p) return;
                if (activePath) activePath.classList.remove('is-glow');
                if (p) p.classList.add('is-glow');
                activePath = p;
            }

            function applyMouseTransform() {
                if (gridLayer) {
                    gridLayer.style.setProperty('--mouse-rx', (currentRX * ROTATE_MAX_GRID).toFixed(3) + 'deg');
                    gridLayer.style.setProperty('--mouse-ry', (currentRY * ROTATE_MAX_GRID).toFixed(3) + 'deg');
                }
                if (linesLayer) {
                    linesLayer.style.setProperty('--mouse-rx', (currentRX * ROTATE_MAX_LINES).toFixed(3) + 'deg');
                    linesLayer.style.setProperty('--mouse-ry', (currentRY * ROTATE_MAX_LINES).toFixed(3) + 'deg');
                }
                // Pieza A v3 — annotations parallax magnitud paritaria a lines
                // (capa misma profundidad visual). Per spec.
                if (annotationsLayer) {
                    annotationsLayer.style.setProperty('--mouse-rx', (currentRX * ROTATE_MAX_LINES).toFixed(3) + 'deg');
                    annotationsLayer.style.setProperty('--mouse-ry', (currentRY * ROTATE_MAX_LINES).toFixed(3) + 'deg');
                }
            }

            function lerpLoop() {
                currentRX += (targetRX - currentRX) * LERP;
                currentRY += (targetRY - currentRY) * LERP;
                applyMouseTransform();
                // Convergencia: target=0 + |current| pequeño → snap a 0 y stop.
                if (
                    targetRX === 0 && targetRY === 0 &&
                    Math.abs(currentRX) < 0.005 && Math.abs(currentRY) < 0.005
                ) {
                    currentRX = 0;
                    currentRY = 0;
                    applyMouseTransform();
                    rafActive = false;
                    return;
                }
                window.requestAnimationFrame(lerpLoop);
            }
            function ensureLoop() {
                if (!rafActive) {
                    rafActive = true;
                    window.requestAnimationFrame(lerpLoop);
                }
            }

            // -----------------------------------------------------------------
            // Pieza A v3 — Hover individual sobre <div class="cad-annotation">.
            // -----------------------------------------------------------------
            // Cada anotación HTML+CSS positioned recibe .is-glow cuando el
            // cursor está dentro de su rect expandido por padding 30 px. Solo
            // UNA simultáneamente. Tiebreak menor-área cuando overlap (aunque
            // las posiciones están diseñadas para NO solapar — defensa).
            //
            // Independiente del glow de las 3 líneas grandes (sistema v2):
            // ambos sistemas pueden glowear simultáneamente porque escriben
            // sobre distintos elementos.
            // -----------------------------------------------------------------
            var HOVER_PADDING = 30;
            var annotations = annotationsLayer
                ? annotationsLayer.querySelectorAll('.cad-annotation')
                : [];
            var activeAnnotation = null;

            function distanceToRect(x, y, r) {
                var dx = Math.max(r.left - x, 0, x - r.right);
                var dy = Math.max(r.top - y, 0, y - r.bottom);
                return Math.sqrt(dx * dx + dy * dy);
            }
            function pickActiveAnnotation(x, y) {
                var best = null;
                var bestDist = Infinity;
                var bestArea = Infinity;
                for (var i = 0; i < annotations.length; i++) {
                    var g = annotations[i];
                    if (window.getComputedStyle(g).display === 'none') continue;
                    var r = g.getBoundingClientRect();
                    if (r.width === 0 && r.height === 0) continue;
                    var inExpanded =
                        x >= r.left - HOVER_PADDING && x <= r.right + HOVER_PADDING &&
                        y >= r.top - HOVER_PADDING && y <= r.bottom + HOVER_PADDING;
                    if (!inExpanded) continue;
                    var d = distanceToRect(x, y, r);
                    var a = r.width * r.height;
                    if (d < bestDist || (d === bestDist && a < bestArea)) {
                        bestDist = d;
                        bestArea = a;
                        best = g;
                    }
                }
                return best;
            }
            function setActiveAnnotation(g) {
                if (activeAnnotation === g) return;
                if (activeAnnotation) activeAnnotation.classList.remove('is-glow');
                if (g) g.classList.add('is-glow');
                activeAnnotation = g;
            }

            function onMouseMove(e) {
                var rect = section.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                var nx = (e.clientX - rect.left) / rect.width;
                var ny = (e.clientY - rect.top) / rect.height;
                if (nx < 0) nx = 0; else if (nx > 1) nx = 1;
                if (ny < 0) ny = 0; else if (ny > 1) ny = 1;
                // signed [-1, +1] desde el centro del hero.
                var sx = nx * 2 - 1;
                var sy = ny * 2 - 1;
                // Convención CSS: rotateY positivo gira eje vertical
                // (right edge hacia el viewer). rotateX positivo gira eje
                // horizontal (top edge hacia el viewer). Queremos que el
                // hover hacia el cursor inquline la capa "hacia" él:
                //   cursor a la derecha (sx>0) → right edge forward → +RY.
                //   cursor arriba (sy<0)       → top edge forward    → +RX.
                // → targetRX = -sy (invertido para que arriba = +RX).
                targetRX = -sy;
                targetRY = sx;
                setGlow(pickActivePath(nx, ny));
                // Pieza A v3 — hover individual sobre cad-annotation.
                setActiveAnnotation(pickActiveAnnotation(e.clientX, e.clientY));
                ensureLoop();
            }
            function onMouseLeave() {
                targetRX = 0;
                targetRY = 0;
                setGlow(null);
                setActiveAnnotation(null);
                ensureLoop();
            }

            function attachMouseHandlers() {
                section.addEventListener('mousemove', onMouseMove);
                section.addEventListener('mouseleave', onMouseLeave);
            }

            // Activación post-timeline: enchufar onComplete al tl GSAP
            // existente. Cuando termine la animación de entrada (~1.3s),
            // se enganchan los listeners. Antes de eso, el hero queda
            // "calmado" — el letter-stagger es el moment of arrival y no
            // queremos competir con interacción mouse simultánea.
            tl.eventCallback('onComplete', attachMouseHandlers);

            return this._super.apply(this, arguments);
        },
    });
});
