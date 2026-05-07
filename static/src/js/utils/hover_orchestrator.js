odoo.define('website_avanzosc_demo.utils.hover_orchestrator', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Hover orchestrator factory — extraído del orchestrator inline de
    // F1.1 v2 (caso_exito.js) para reuso en F2 (equipo.js, hover sobre
    // 8 cards del grid del equipo). Patrón mismo, targets distintos.
    //
    // Responsabilidades:
    //   - Desktop mouse: pointerenter/pointerleave per target →
    //     toggle `.is-hovered` en target + `data-hover-active` en root.
    //   - Mobile touch: click delegado en root → toggle `.is-hovered`
    //     con auto-clear setTimeout(autoClearMs) cancelable.
    //   - Click fuera del root: clearAllHovered.
    //   - Discriminación mouse/touch via pointerdown captura
    //     `lastPointerType`.
    //
    // API:
    //   var orch = createHoverOrchestrator({
    //       root: <Element>,             // recibe data-hover-active
    //       targets: [Element, ...],     // hover-targets para attach
    //                                    //   pointerenter/leave per-element
    //       targetSelector: '.x, .y',    // selector compuesto para
    //                                    //   closest() en click delegado
    //       autoClearMs: 2500,           // (optional, default 2500)
    //   });
    //   // ...
    //   orch.destroy();   // limpia listeners y timeout pendiente
    //
    // CSS contract: el consumer aplica reglas para
    //   - `[data-hover-active] .target:not(.is-hovered)` → dim.
    //   - `.target.is-hovered` → hover-in styles.
    //
    // pointerenter/pointerleave NO bubblean → attach per-target. Click,
    // pointerdown → delegados al root (bubblean).
    // -------------------------------------------------------------------

    var DEFAULT_AUTO_CLEAR_MS = 2500;

    function createHoverOrchestrator(opts) {
        var root = opts.root;
        var targets = opts.targets;
        var targetSelector = opts.targetSelector;
        var autoClearMs = opts.autoClearMs || DEFAULT_AUTO_CLEAR_MS;

        var lastPointerType = 'mouse';
        var touchTimeoutId = null;
        var perTargetHandlers = [];

        function clearTouchTimeout() {
            if (touchTimeoutId) {
                window.clearTimeout(touchTimeoutId);
                touchTimeoutId = null;
            }
        }

        function handleHoverIn(target) {
            target.classList.add('is-hovered');
            root.setAttribute('data-hover-active', '');
        }

        function handleHoverOut(target) {
            target.classList.remove('is-hovered');
            if (!root.querySelector('.is-hovered')) {
                root.removeAttribute('data-hover-active');
            }
        }

        function clearAllHovered() {
            var hovered = root.querySelectorAll('.is-hovered');
            for (var i = 0; i < hovered.length; i++) {
                hovered[i].classList.remove('is-hovered');
            }
            root.removeAttribute('data-hover-active');
            clearTouchTimeout();
        }

        function findHoverTarget(node) {
            if (!node || typeof node.closest !== 'function') return null;
            return node.closest(targetSelector);
        }

        function makePointerEnter(target) {
            return function (e) {
                if (e.pointerType !== 'mouse') return;
                if (target.classList.contains('is-hovered')) return;
                clearAllHovered();
                handleHoverIn(target);
            };
        }

        function makePointerLeave(target) {
            return function (e) {
                if (e.pointerType !== 'mouse') return;
                handleHoverOut(target);
            };
        }

        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            var enterFn = makePointerEnter(target);
            var leaveFn = makePointerLeave(target);
            target.addEventListener('pointerenter', enterFn);
            target.addEventListener('pointerleave', leaveFn);
            perTargetHandlers.push({ el: target, enter: enterFn, leave: leaveFn });
        }

        function onPointerDown(e) {
            lastPointerType = e.pointerType || 'mouse';
        }
        root.addEventListener('pointerdown', onPointerDown, true);

        function onRootClick(e) {
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
                }, autoClearMs);
            }
        }
        root.addEventListener('click', onRootClick);

        function onDocumentClick(e) {
            if (root.contains(e.target)) return;
            if (root.querySelector('.is-hovered')) {
                clearAllHovered();
            }
        }
        document.addEventListener('click', onDocumentClick);

        return {
            destroy: function () {
                perTargetHandlers.forEach(function (h) {
                    h.el.removeEventListener('pointerenter', h.enter);
                    h.el.removeEventListener('pointerleave', h.leave);
                });
                perTargetHandlers = [];
                root.removeEventListener('pointerdown', onPointerDown, true);
                root.removeEventListener('click', onRootClick);
                document.removeEventListener('click', onDocumentClick);
                clearTouchTimeout();
            },
        };
    }

    return {
        createHoverOrchestrator: createHoverOrchestrator,
        DEFAULT_AUTO_CLEAR_MS: DEFAULT_AUTO_CLEAR_MS,
    };
});
