odoo.define('website_avanzosc_demo.main', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscRoot = publicWidget.Widget.extend({
        selector: '#wrap',
        start: function () {
            // ----------------------------------------------------------------
            // Lenis smooth scroll — inicialización global.
            // No inicializar si el usuario tiene prefers-reduced-motion: reduce
            // activado. CLAUDE.md §5, spec §9.1 (Lenis 1.0.42).
            // La librería CDN se carga vía views/assets.xml (task 0.4).
            // window.lenis expuesto para diagnóstico (Playwright / DevTools).
            //
            // Wrapper = `#wrapwrap` (Odoo Community v14): el módulo `website`
            // pone `overflow: hidden` en `html, body, #wrapwrap` y usa
            // `#wrapwrap` (height = viewport, overflow: auto) como el único
            // elemento que realmente scrollea. Sin `wrapper: wrapwrap`, Lenis
            // se ata a window que no scrollea — quedaba idle en `isScrolling:
            // false` permanente sin aportar nada (bug de Task 0.6 detectado
            // durante la implementación de Task 1.3).
            //
            // Content = wrapwrap (mismo elemento que wrapper): el DOM real
            // tiene `#wrapwrap > {header, main, footer}` como hijos paralelos,
            // sin un wrapper único intermedio. `content: wrapwrap` hace que
            // Lenis mida `wrapwrap.offsetHeight` (que abarca los 3 hijos)
            // para calcular el scroll-limit. Decisión sesión 2026-04-28
            // («(α)+(ε)») validada empíricamente.
            //
            // autoToggle: true — defensivo: Lenis se auto-pausa si el wrapper
            // no necesita smoothing (e.g. contenido más corto que viewport).
            // ----------------------------------------------------------------
            var wrapwrap = document.getElementById('wrapwrap');
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                // No-op: respect user preference. window.lenis queda undefined.
            } else if (wrapwrap && typeof window.Lenis === 'function') {
                var lenis = new window.Lenis({
                    wrapper: wrapwrap,
                    content: wrapwrap,
                    autoToggle: true,
                });
                window.lenis = lenis;

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);

                // ----------------------------------------------------------------
                // Smooth anchor scroll. Lenis 1.0.42 NO expone la opción
                // `anchors` del constructor (verificado contra
                // cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42 — solo
                // expone `scrollTo`; la opción `anchors` aparece en versiones
                // posteriores y por eso aparecía en docs Lenis sin pin de
                // versión). Implementación manual: listener delegado en
                // document para clicks a `<a href="#…">` same-page que delega
                // a Lenis con:
                //   - duration: 0.8s, alineado con CLAUDE.md §5 «800-1200ms
                //     entradas grandes»; un anchor scroll es entrada grande.
                //   - easing: ease-out expo `(t) => 1 - 2^(-10t)`. Equivalente
                //     funcional al cubic-bezier(0.16,1,0.3,1) de CLAUDE.md §5.
                // HEADER_OFFSET: header sticky scrolled ~62px alto. Restando
                // 80px de el.offsetTop el target queda ~64px del viewport top
                // (Lenis añade ~+16px de bias residual sobre scrollTo). Ese
                // margen sitúa el border-box justo bajo el header sin overlap;
                // el contenido visible (h2) cae naturalmente con aire gracias
                // al padding-top interno de cada snippet.
                //
                // Calculamos el pixel target manualmente (`el.offsetTop -
                // HEADER_OFFSET`) en lugar de pasar `{offset:-80, target:el}`
                // a lenis.scrollTo: la firma element-based suma sesgos
                // adicionales que pueden mover el target detrás del header
                // (verificado empíricamente en Phase post-v1).
                //
                // history.pushState mantiene la URL compartible y respeta back
                // button (state=null, title vacío — comportamiento nativo).
                //
                // Reduced-motion: rama no entra (Lenis no se instancia).
                // Browser hace jump nativo dentro de #wrapwrap — aceptado per
                // CLAUDE.md §5 (skip animation).
                // ----------------------------------------------------------------
                var HEADER_OFFSET = 80;
                var easeOutExpo = function (t) { return 1 - Math.pow(2, -10 * t); };
                var SCROLL_OPTS = { duration: 0.8, easing: easeOutExpo };
                var scrollToElement = function (el) {
                    var top = Math.max(0, el.offsetTop - HEADER_OFFSET);
                    lenis.scrollTo(top, SCROLL_OPTS);
                };
                document.addEventListener('click', function (e) {
                    if (e.defaultPrevented) return;
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    var a = e.target.closest && e.target.closest('a[href]');
                    if (!a) return;
                    var href = a.getAttribute('href');
                    if (!href || href.charAt(0) !== '#' || href.length < 2) return;
                    var target;
                    try {
                        target = document.querySelector(href);
                    } catch (err) {
                        return;
                    }
                    if (!target) return;
                    e.preventDefault();
                    if (window.history && typeof window.history.pushState === 'function') {
                        window.history.pushState(null, '', href);
                    }
                    scrollToElement(target);
                });

                // ----------------------------------------------------------------
                // Cross-page anchor bootstrap. Cuando el usuario navega a
                // `/#equipo` (link cross-page desde Conócenos) o equivalente,
                // el browser intentará saltar nativamente al elemento con
                // ese id en el primer paint de la nueva página, antes de que
                // Lenis tome control del scroll. Resultado: jump nativo sin
                // smooth, contradiciendo el comportamiento same-page.
                //
                // Patrón: tras inicializar Lenis, si hay hash en la URL,
                // suprimir la restauración nativa del browser
                // (history.scrollRestoration = 'manual'), volver al top y
                // delegar a Lenis con las mismas opciones. requestAnimationFrame
                // garantiza que el target ya está layouteado antes del scrollTo.
                // ----------------------------------------------------------------
                if (window.location.hash && window.location.hash.length > 1) {
                    try {
                        var bootstrapTarget = document.querySelector(window.location.hash);
                        if (bootstrapTarget) {
                            if ('scrollRestoration' in window.history) {
                                window.history.scrollRestoration = 'manual';
                            }
                            // rAF callback runs DESPUÉS del native scroll-to-hash
                            // del browser. Reseteamos wrap.scrollTop a 0 y
                            // delegamos a scrollToElement (que calcula el
                            // pixel value `el.offsetTop - HEADER_OFFSET`,
                            // evitando la varianza element-based de Lenis).
                            window.requestAnimationFrame(function () {
                                wrapwrap.scrollTop = 0;
                                scrollToElement(bootstrapTarget);
                            });
                        }
                    } catch (e) {
                        // querySelector lanza si el hash no es selector CSS
                        // válido (e.g. `#1foo`). Silenciar — comportamiento
                        // nativo del browser sirve de fallback aceptable.
                    }
                }
            } else if (typeof window.Lenis === 'undefined') {
                // CDN failure (network block, ad-blocker, etc.). Sticky header
                // falls back to native scroll path on `#wrapwrap` per Task 1.3.
                console.warn('[website_avanzosc_demo] Lenis CDN unavailable, smooth scroll disabled');
            }

            // ----------------------------------------------------------------
            // Lucide Icons: reemplaza todos los elementos con atributo
            // data-lucide por el SVG correspondiente.
            // La librería CDN lucide.min.js se carga desde <head> vía
            // views/assets.xml (template head_external_assets).
            // Ref: CLAUDE.md §9.7, spec §3.3 punto 2.
            // ----------------------------------------------------------------
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }

            // ----------------------------------------------------------------
            // Sticky header — clase «is-scrolled» (Task 1.3)
            // ----------------------------------------------------------------
            // Sticky position lo proporciona el SCSS (_header.scss). Aquí
            // solo añadimos/quitamos la clase `is-scrolled` cuando el scroll
            // pasa de 100px en `#wrapwrap` (el elemento que realmente
            // scrollea en Odoo 14 — html/body tienen overflow: hidden).
            //
            // Listener dual:
            //   - Lenis activo (no reduced-motion): `lenis.on('scroll', cb)`
            //     es el patrón canónico per la API de Lenis 1.0.42. El
            //     callback recibe la instancia y leemos `lenis.scroll`. No
            //     necesita rAF throttle propio — Lenis ya emite el evento al
            //     ritmo del rAF interno.
            //   - Reduced-motion (Lenis no instanciado, ver bloque arriba):
            //     `#wrapwrap.addEventListener('scroll', ...)` nativo con
            //     throttle rAF (1 frame ≈ 16ms). Leemos `wrapwrap.scrollTop`.
            //
            // Threshold = 100px (briefing 1.3). Transición visual la maneja
            // el SCSS (padding + box-shadow, 250ms ease-out expo).
            // ----------------------------------------------------------------
            var headerEl = document.querySelector('header');
            if (headerEl && wrapwrap) {
                var SCROLL_THRESHOLD = 100;
                var applyScrolledState = function (scrollValue) {
                    headerEl.classList.toggle(
                        'is-scrolled',
                        scrollValue > SCROLL_THRESHOLD
                    );
                };
                if (window.lenis && typeof window.lenis.on === 'function') {
                    // Lenis canonical event — fires on smooth scroll animation.
                    window.lenis.on('scroll', function (lenis) {
                        applyScrolledState(lenis.scroll);
                    });
                    applyScrolledState(window.lenis.scroll);
                } else {
                    // Reduced-motion fallback: native scroll on wrapwrap with rAF.
                    var ticking = false;
                    var checkScroll = function () {
                        ticking = false;
                        applyScrolledState(wrapwrap.scrollTop);
                    };
                    wrapwrap.addEventListener('scroll', function () {
                        if (!ticking) {
                            ticking = true;
                            window.requestAnimationFrame(checkScroll);
                        }
                    }, { passive: true });
                    applyScrolledState(wrapwrap.scrollTop);
                }
            }

            return this._super.apply(this, arguments);
        },
    });

    return publicWidget.registry.AvanzoscRoot;
});
