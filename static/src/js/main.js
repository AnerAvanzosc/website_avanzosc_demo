/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.AvanzoscRoot = publicWidget.Widget.extend({
        selector: '#wrap',
        start: function () {
            // ----------------------------------------------------------------
            // M6 (auditoría 2026-06-11) — el overflow menu «+» del navbar
            // (o_extra_menu_items) lo genera el JS core auto_hide_menu.js
            // con role="presentation" en un <div> hijo directo del <ul> y
            // role="menuitem" en su toggle — markup inconsistente con la
            // decisión C1 (roles de menú eliminados vía herencia XML en
            // layout.xml) y disparador de axe critical aria-required-parent
            // + serious list. Al ser DOM generado en runtime no es alcanzable
            // por xpath: se corrige aquí cuando aparece. role="listitem" en
            // el div (es un item de la lista del nav, igual que sus <li>
            // hermanos) y sin role en el link, como el resto del navbar C1.
            // ----------------------------------------------------------------
            var topMenu = document.querySelector('header#top .top_menu');
            if (topMenu && 'MutationObserver' in window) {
                var fixExtraMenu = function () {
                    var extra = topMenu.querySelector('.o_extra_menu_items');
                    if (!extra) { return false; }
                    extra.setAttribute('role', 'listitem');
                    var toggle = extra.querySelector('.dropdown-toggle');
                    if (toggle) { toggle.removeAttribute('role'); }
                    return true;
                };
                if (!fixExtraMenu()) {
                    var menuObserver = new MutationObserver(function () {
                        if (fixExtraMenu()) { menuObserver.disconnect(); }
                    });
                    menuObserver.observe(topMenu, { childList: true });
                }
            }
            // ----------------------------------------------------------------
            // Lenis smooth scroll — inicialización global.
            // No inicializar si el usuario tiene prefers-reduced-motion: reduce
            // activado. CLAUDE.md §5, spec §9.1 (Lenis 1.0.42).
            // La librería CDN se carga vía views/assets.xml (task 0.4).
            // window.lenis expuesto para diagnóstico (Playwright / DevTools).
            //
            // v18 scroller: window (Lenis defaults). En v14, Odoo ponía
            // `overflow: hidden` en html/body y el scroll vivía en
            // `#wrapwrap` (overflow: auto) — por eso el código original
            // pasaba `wrapper: wrapwrap, content: wrapwrap`. En v18
            // `#wrapwrap` es `overflow: visible` y el scroller real es
            // `window`/documentElement (verificado empíricamente F12.1:
            // wrapwrap.scrollTop quedaba 0 al scrollear). Los defaults de
            // Lenis (wrapper: window, content: documentElement) son
            // exactamente eso, así que basta con omitir ambos params.
            //
            // autoToggle: true — defensivo: Lenis se auto-pausa si el wrapper
            // no necesita smoothing (e.g. contenido más corto que viewport).
            // ----------------------------------------------------------------
            // B5 (auditoría 2026-06-11): todos los widgets evalúan
            // matchMedia una sola vez en start(); si el usuario cambia la
            // preferencia con la página abierta no se respetaba hasta
            // recargar. El CSS sí es live (media query), pero los tweens
            // GSAP/Lenis en vuelo y los inline styles no. Reload es el fix
            // proporcionado: evento rarísimo (ajuste de SO), y re-inicializa
            // los 9 widgets con el gating correcto sin re-arquitectura.
            var reducedMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (typeof reducedMotionMQ.addEventListener === 'function') {
                reducedMotionMQ.addEventListener('change', function () {
                    window.location.reload();
                });
            }

            if (reducedMotionMQ.matches) {
                // No-op: respect user preference. window.lenis queda undefined.
            } else if (typeof window.Lenis === 'function') {
                var lenis = new window.Lenis({
                    autoToggle: true,
                });
                window.lenis = lenis;

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);

                // ----------------------------------------------------------------
                // GSAP ScrollTrigger ↔ Lenis bridge (Pieza E v3, ajustado v18).
                // Con el scroller en window (default nativo de ScrollTrigger),
                // el patrón canónico Lenis+ST se reduce a:
                //   1. lenis.on('scroll', ScrollTrigger.update) — cada paso de
                //      Lenis (smoothed) dispara update de los triggers.
                //   2. NO scrollerProxy: solo se necesita cuando el scroller es
                //      un elemento custom (el wrapwrap de v14). Con window,
                //      ScrollTrigger lee window.scrollY nativamente.
                //   3. NO ScrollTrigger.defaults({scroller}): el default ya es
                //      window. Los triggers de timeline.js lo heredan.
                //   4. NO pinType: 'transform': con scroller window, el pin usa
                //      position: fixed (default correcto).
                //
                // Gating: sólo se ejecuta si Lenis está activo (estamos dentro
                // del else-if Lenis); reduced-motion ya no entra. Guard explícito
                // de gsap + ScrollTrigger por si el CDN del plugin falla
                // (ad-blocker, regresión en assets.xml).
                // ----------------------------------------------------------------
                if (typeof window.gsap !== 'undefined' &&
                    typeof window.ScrollTrigger !== 'undefined') {
                    var ST = window.ScrollTrigger;
                    window.gsap.registerPlugin(ST);
                    lenis.on('scroll', ST.update);
                }

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
                // El offset se deriva dinámicamente de la altura real del
                // header al momento del click. Header en EU mide ~100 px
                // (navbar wrappea a 2 líneas por etiquetas más largas)
                // mientras que en ES mide ~62 px. Un offset fijo de 80 px
                // dejaría el target tras el header en EU (overlap de 36 px).
                // Lenis suma además ~+16 px de bias residual en scrollTo;
                // restamos 20 px adicionales como aire visual sobre el header
                // para compensar y dejar el target con clearance ≥30 px en
                // ambos idiomas.
                var BREATHING = 20;
                var easeOutExpo = function (t) { return 1 - Math.pow(2, -10 * t); };
                var SCROLL_OPTS = { duration: 0.8, easing: easeOutExpo };
                var scrollToElement = function (el) {
                    var headerEl = document.querySelector('header');
                    var headerHeight = headerEl ? headerEl.offsetHeight : 80;
                    var offset = headerHeight + BREATHING;
                    var top = Math.max(0, el.offsetTop - offset);
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
                            // del browser. Reseteamos el scroll de window a 0 y
                            // delegamos a scrollToElement (que calcula el
                            // pixel value `el.offsetTop - HEADER_OFFSET`,
                            // evitando la varianza element-based de Lenis).
                            // v18: el scroller es window, no #wrapwrap.
                            window.requestAnimationFrame(function () {
                                window.scrollTo(0, 0);
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
            // Page transition fade overlay (sub-bloque A post-v1, ajustado A6).
            // Listener delegado en document a clicks de <a href> internos.
            // Cuando el click cumple los filtros, e.preventDefault() bloquea
            // la navegación nativa, body.is-leaving activa el fade-in CSS de
            // la overlay (100ms duración) y tras setTimeout(90) ejecutamos
            // window.location.href = href. Nav se dispara ~10ms antes de
            // que el overlay termine de pintarse para que el render del
            // destino empiece bajo el final del overlay sin gap blanco. La
            // overlay queda visible hasta que la nueva página carga; el CSS
            // default la pone a opacity 0 sin fade-in (decisión sub-bloque A:
            // fade-out only).
            //
            // Recorte 200→100 / 200→90 (Propuesta D, post-v1 A6): el fade
            // más corto evita que el usuario forme la expectativa
            // «transición completa, ya estoy» seguida de blanco residual
            // durante el JS lazy parse (70-150 ms post-paint). Recortado, la
            // transición se siente como una carga normal del browser.
            //
            // Filtros (skip → comportamiento nativo del browser):
            //  - Modifier keys / button distinto del izquierdo (cmd/ctrl/shift/alt
            //    abren en pestaña/ventana nueva — respetar UX nativa).
            //  - target=_blank, [download].
            //  - mailto:, tel:, javascript:.
            //  - Externos (origin distinto): si interceptáramos, la overlay
            //    quedaría visible permanentemente al salir del sitio.
            //  - Hash-only same-page: lo maneja el listener anchor de arriba.
            //  - Misma URL exacta sin cambio significativo (no-op).
            //  - prefers-reduced-motion: bypass total (CLAUDE.md §5).
            //
            // pageshow + event.persisted=true: limpia body.is-leaving cuando
            // el browser restaura desde back-forward cache (sin esto, al
            // volver con back button la overlay quedaría visible).
            //
            // Vivimos dentro de AvanzoscRoot.start() (selector #wrap, ya
            // funcionando) en lugar de un widget propio porque publicWidget
            // con selector body no se auto-instanciaba en este módulo
            // (verificado empíricamente sesión post-v1).
            // ----------------------------------------------------------------
            var reducedMotionPT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            document.addEventListener('click', function (e) {
                if (reducedMotionPT) return;
                if (e.defaultPrevented) return;
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                var a = e.target.closest && e.target.closest('a[href]');
                if (!a) return;
                if (a.target === '_blank' || a.hasAttribute('download')) return;
                var href = a.getAttribute('href');
                if (!href) return;
                var lowered = href.toLowerCase();
                if (lowered.indexOf('mailto:') === 0 ||
                    lowered.indexOf('tel:') === 0 ||
                    lowered.indexOf('javascript:') === 0) {
                    return;
                }
                if (href.charAt(0) === '#') return;
                var url;
                try {
                    url = new URL(href, window.location.href);
                } catch (err) {
                    return;
                }
                if (url.origin !== window.location.origin) return;
                if (url.pathname === window.location.pathname &&
                    url.search === window.location.search &&
                    (!url.hash || url.hash === window.location.hash)) {
                    return;
                }
                e.preventDefault();
                document.body.classList.add('is-leaving');
                window.setTimeout(function () {
                    window.location.href = href;
                }, 90);
            });
            window.addEventListener('pageshow', function (e) {
                if (e.persisted) {
                    document.body.classList.remove('is-leaving');
                }
            });

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
            // Sticky header — clase «is-scrolled» (Task 1.3, ajustado v18)
            // ----------------------------------------------------------------
            // Sticky position lo proporciona el SCSS (_header.scss). Aquí
            // solo añadimos/quitamos la clase `is-scrolled` cuando el scroll
            // pasa de 100px. v18: el scroller es window (en v14 era #wrapwrap
            // con html/body overflow: hidden).
            //
            // Listener dual:
            //   - Lenis activo (no reduced-motion): `lenis.on('scroll', cb)`
            //     es el patrón canónico per la API de Lenis 1.0.42. El
            //     callback recibe la instancia y leemos `lenis.scroll`. No
            //     necesita rAF throttle propio — Lenis ya emite el evento al
            //     ritmo del rAF interno.
            //   - Reduced-motion (Lenis no instanciado, ver bloque arriba):
            //     `window.addEventListener('scroll', ...)` nativo con
            //     throttle rAF (1 frame ≈ 16ms). Leemos `window.scrollY`.
            //
            // Threshold = 100px (briefing 1.3). Transición visual la maneja
            // el SCSS (padding + box-shadow, 250ms ease-out expo).
            // ----------------------------------------------------------------
            var headerEl = document.querySelector('header');
            if (headerEl) {
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
                    // Reduced-motion fallback: native scroll on window with rAF.
                    var ticking = false;
                    var checkScroll = function () {
                        ticking = false;
                        applyScrolledState(window.scrollY);
                    };
                    window.addEventListener('scroll', function () {
                        if (!ticking) {
                            ticking = true;
                            window.requestAnimationFrame(checkScroll);
                        }
                    }, { passive: true });
                    applyScrolledState(window.scrollY);
                }
            }

            return this._super.apply(this, arguments);
        },
    });
