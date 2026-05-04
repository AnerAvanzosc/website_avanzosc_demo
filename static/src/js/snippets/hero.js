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
            // Pieza A — refs a los 2 layers de decoración (CSS grid + SVG lines).
            var gridLayer = section.querySelector('.s_avanzosc_hero_grid');
            var linesLayer = section.querySelector('.s_avanzosc_hero_lines');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (reducedMotion) {
                // SCSS @include reduced-motion fuerza visibility (incl. layers
                // Pieza A en estado final); nada que hacer.
                return this._super.apply(this, arguments);
            }

            // Pieza A — Parallax: vanilla scroll listener + rAF debounce.
            // Razón de NO usar GSAP ScrollTrigger (aunque el plugin está
            // cargado en assets.xml head): timeline.js (Task 3.8) documenta
            // explícitamente que ScrollTrigger requiere scroller-proxy +
            // sync con Lenis (~30 líneas integración) para funcionar
            // correctamente en el `#wrapwrap` de Odoo. Escolhar IO-style
            // o vanilla scroll fue la decisión del módulo. Para parallax
            // continuo (no one-shot) IO no aplica (no da progreso continuo);
            // vanilla scroll + rAF es el patrón nativo equivalente, 10 líneas,
            // sin scope expansion ni dependencia adicional.
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
            function applyParallax() {
                var rect = section.getBoundingClientRect();
                // progress 0→1 mientras el hero sale del viewport por arriba.
                var heroHeight = rect.height || 1;
                var progress = Math.max(0, Math.min(1, -rect.top / heroHeight));
                // Líneas: -15% al fully scrolled past, dots: -5% (más lento atrás).
                if (linesLayer) {
                    linesLayer.style.transform = 'translate3d(0, ' + (progress * -15) + '%, 0)';
                }
                if (gridLayer) {
                    gridLayer.style.transform = 'translate3d(0, ' + (progress * -5) + '%, 0)';
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

            return this._super.apply(this, arguments);
        },
    });
});
