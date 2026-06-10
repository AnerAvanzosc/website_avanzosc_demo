/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

    // -------------------------------------------------------------------
    // F4 v3 — Background boxes layer (grid isométrico interactivo) en
    // §3 Sectores.
    //
    // Genera al runtime una matriz de cells (rows × cols, configurable
    // vía data-rows/data-cols del .s_avanzosc_sectores_boxes element).
    //
    // F4 v3 cambios sobre F4 v2:
    //   - Densidad: 30×20=600 → 40×25=1000 cells.
    //   - Trail: F4 v2 mantenía cells .is-hovered durante 1500ms con
    //     fade-out 600ms (Map<cell, timeoutId>). F4 v3 elimina el hold:
    //     una sola cell .is-hovered en cualquier momento — la actual.
    //     Cuando el cursor se mueve a otra cell, la previa pierde
    //     .is-hovered + .color-* inmediatamente (el CSS fade-out 200ms
    //     hace una estela muy corta del background-color).
    //   - Multi-color: cada cell hovered recibe color-1..4 random.
    //
    // Listener delegado pointermove en el container; pointerleave del
    // container limpia la cell actual cuando el cursor sale del grid.
    //
    // Reduced-motion: el guard salta los listeners. El grid sigue
    // visible (estado visual estático).
    //
    // Mobile / touch-only / <768px: el .boxes layer queda oculto vía
    // CSS @media display:none. JS sigue inicializando widget pero el
    // listener cuelga sobre un elemento invisible — sin coste práctico.
    //
    // Performance: pointermove delegado + closest sobre 1000 cells es
    // <1ms por evento. Sin Map ni setTimeout, menor overhead que v2.
    // -------------------------------------------------------------------

const COLOR_VARIANTS = 4;  // color-1..color-4

publicWidget.registry.AvanzoscSectoresBoxes = publicWidget.Widget.extend({
        selector: '.s_avanzosc_sectores_boxes',

        start: function () {
            var container = this.el;
            var rows = parseInt(container.getAttribute('data-rows'), 10) || 30;
            var cols = parseInt(container.getAttribute('data-cols'), 10) || 20;
            var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Generar la matriz de cells. Outer loop = rows (cada uno
            // es un column-flex container); inner = cols (cells
            // verticales dentro del row).
            for (var i = 0; i < rows; i++) {
                var rowEl = document.createElement('div');
                rowEl.className = 's_avanzosc_sectores_boxes_row';
                for (var j = 0; j < cols; j++) {
                    var cell = document.createElement('div');
                    cell.className = 's_avanzosc_sectores_boxes_cell';
                    // Iconos «+» decorativos cada 2×2 cells.
                    if (i % 2 === 0 && j % 2 === 0) {
                        cell.classList.add('has-plus');
                    }
                    rowEl.appendChild(cell);
                }
                container.appendChild(rowEl);
            }

            // Reduced-motion: skipear listener interactivo. Grid queda
            // como capa visual estática.
            if (reducedMotion) {
                return this._super.apply(this, arguments);
            }

            // Helper: limpia las clases is-hovered y color-* de una cell.
            function clearCellState(cell) {
                if (!cell) return;
                cell.classList.remove('is-hovered');
                for (var c = 1; c <= COLOR_VARIANTS; c++) {
                    cell.classList.remove('color-' + c);
                }
            }

            // En cualquier momento hay 0 o 1 cells con .is-hovered.
            // Sin trail histórico, sin Map, sin timeouts.
            var currentCell = null;

            function onPointerMove(e) {
                if (!e.target || typeof e.target.closest !== 'function') return;
                var cell = e.target.closest('.s_avanzosc_sectores_boxes_cell');
                if (cell === currentCell) return;
                if (currentCell) {
                    clearCellState(currentCell);
                }
                if (cell) {
                    var colorIdx = 1 + Math.floor(Math.random() * COLOR_VARIANTS);
                    cell.classList.add('is-hovered', 'color-' + colorIdx);
                }
                currentCell = cell;
            }

            function onPointerLeave() {
                if (currentCell) {
                    clearCellState(currentCell);
                    currentCell = null;
                }
            }

            container.addEventListener('pointermove', onPointerMove);
            container.addEventListener('pointerleave', onPointerLeave);

            // Stash for destroy.
            this._pointerMoveHandler = onPointerMove;
            this._pointerLeaveHandler = onPointerLeave;
            this._container = container;
            this._clearCellState = clearCellState;
            this._getCurrentCell = function () { return currentCell; };
            this._resetCurrentCell = function () { currentCell = null; };

            return this._super.apply(this, arguments);
        },

        destroy: function () {
            if (this._container) {
                if (this._pointerMoveHandler) {
                    this._container.removeEventListener('pointermove', this._pointerMoveHandler);
                }
                if (this._pointerLeaveHandler) {
                    this._container.removeEventListener('pointerleave', this._pointerLeaveHandler);
                }
            }
            // Cleanup state de la cell actual si destroy se llama
            // mientras el cursor está sobre el grid.
            if (this._clearCellState && this._getCurrentCell) {
                this._clearCellState(this._getCurrentCell());
                this._resetCurrentCell();
            }
            return this._super.apply(this, arguments);
        },
    });
