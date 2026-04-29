odoo.define('website_avanzosc_demo.snippets.contacto', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // /contacto hero — letter-stagger entrance.
    //
    // Patrón derivado del s_avanzosc_hero principal (hero.js Phase 3.10):
    //   1. Splitting.js wrapea cada char del H1 en <span class="char">.
    //   2. GSAP timeline anima:
    //        a. chars: opacity 0→1 + y 20→0, duration 0.4s, stagger 25ms,
    //           ease expo.out.
    //        b. subtítulo: opacity 0→1 + y 12→0, duration 0.3s, delay 0.6s.
    //
    // Diferencia vs hero principal: aquí NO hay CTAs en el hero (la CTA
    // del flujo es el form de abajo). Timeline más corta.
    //
    // Selector específico .s_avanzosc_contacto_hero — no global: respeta
    // el aprendizaje sub-bloque A («publicWidget con selector body o
    // demasiado genérico no se auto-instancia»).
    //
    // Reduced-motion: skip animación; SCSS @reduced-motion fuerza estado
    // final visible.
    //
    // GSAP/Splitting fallback: si las CDN no cargaron, dejamos el claim
    // visible (opacity 1) para no quedar el hero permanentemente vacío.
    // -------------------------------------------------------------------

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscContactoHero = publicWidget.Widget.extend({
        selector: '.s_avanzosc_contacto_hero',

        start: function () {
            var section = this.el;
            var claim = section.querySelector('.s_avanzosc_contacto_hero_claim');
            var subtitle = section.querySelector('.s_avanzosc_contacto_hero_subtitle');
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (reducedMotion) {
                return this._super.apply(this, arguments);
            }

            if (typeof window.gsap === 'undefined') {
                console.warn('[website_avanzosc_demo] GSAP not loaded, /contacto hero animation skipped');
                if (claim) claim.style.opacity = '1';
                if (subtitle) {
                    subtitle.style.opacity = '1';
                    subtitle.style.transform = 'none';
                }
                return this._super.apply(this, arguments);
            }

            var gsap = window.gsap;
            var hasSplitting = typeof window.Splitting === 'function' && claim;
            if (hasSplitting) {
                window.Splitting({ target: claim, by: 'chars' });
            }

            // El SCSS deja .claim a opacity:0 para esconder el flicker
            // pre-Splitting. Tras split, los .char heredan estado oculto;
            // levantamos el opacity del padre y animamos los hijos.
            gsap.set(claim, { opacity: 1 });

            var tl = gsap.timeline();

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
                tl.to(claim, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: 'expo.out',
                });
            }

            if (subtitle) {
                tl.to(subtitle, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    ease: 'expo.out',
                }, 0.6);
            }

            return this._super.apply(this, arguments);
        },
    });
});
