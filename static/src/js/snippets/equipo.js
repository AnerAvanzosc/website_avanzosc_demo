/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import hoverUtil from "@website_avanzosc_demo/js/utils/hover_orchestrator";

    // -------------------------------------------------------------------
    // F2 v2 — hover dramático sobre el grid de 8 tarjetas del equipo.
    //
    // Selector: `.s_avanzosc_equipo` (sección entera). El widget engancha
    // siempre que la sección exista; el guard interno return-early evita
    // engancharse si el grid no está en DOM (defensa por si alguna versión
    // del snippet se usa sin el grid en el futuro).
    //
    // Reusa el util `hover_orchestrator` (extraído del orchestrator
    // inline de F1.1 v2 caso_exito.js). Mismo patrón:
    //   - Desktop mouse: pointerenter/leave per-card → toggle .is-hovered
    //     en card + data-hover-active en grid.
    //   - Mobile touch: click delegado → toggle con auto-clear 2500ms.
    //   - Click fuera del grid: clearAllHovered.
    //
    // CSS contract con _equipo.scss:
    //   - `.s_avanzosc_equipo_grid[data-hover-active]
    //      .s_avanzosc_equipo_card:not(.is-hovered)` → opacity 0.55 (dim).
    //   - `.s_avanzosc_equipo_card.is-hovered` → translateY(-4) +
    //      box-shadow grande.
    //   - `.s_avanzosc_equipo_card.is-hovered .s_avanzosc_equipo_card_avatar`
    //     → scale(1.05) + box-shadow naranja (CEO) o oscuro.
    //
    // Reveal padre (data-avanzosc-reveal en la section) sigue gestionado
    // por AvanzoscReveal (reveal.js) — sin interferencia.
    // -------------------------------------------------------------------

publicWidget.registry.AvanzoscEquipo = publicWidget.Widget.extend({
        selector: '.s_avanzosc_equipo',

        start: function () {
            var section = this.el;
            var grid = section.querySelector('.s_avanzosc_equipo_grid');
            if (!grid) {
                return this._super.apply(this, arguments);
            }

            var cards = grid.querySelectorAll('.s_avanzosc_equipo_card');
            if (cards.length === 0) {
                return this._super.apply(this, arguments);
            }

            this._hoverOrch = hoverUtil.createHoverOrchestrator({
                root: grid,
                targets: Array.prototype.slice.call(cards),
                targetSelector: '.s_avanzosc_equipo_card',
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
