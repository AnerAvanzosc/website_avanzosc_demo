odoo.define('website_avanzosc_demo.utils.count_up', function (require) {
    'use strict';

    // -------------------------------------------------------------------
    // Count-up util — extraído de Task 3.5 (contador.js) para reuso por
    // F1 (caso_exito.js KPI count-up del SVG dashboard).
    //
    // Forma:
    //   - `paintFinal(node)`: pinta target + suffix directo, marca counted.
    //     Usado bajo prefers-reduced-motion o sin IntersectionObserver.
    //   - `animate(node, durationMs)`: rAF loop con interpolación
    //     easeOutCubic 0→target durante `durationMs`. One-shot via
    //     `data-counted="true"`.
    //
    // Convención de atributos esperada en el nodo:
    //   - `data-target` (obligatorio): valor final entero (parseInt).
    //   - `data-start` (opcional, default 0): valor inicial entero. F3
    //     introduce este attr para «2008» que arranca en 1900 (no 0).
    //     Sin data-start, comportamiento idéntico a contador.js + caso_exito
    //     KPIs (start=0).
    //   - `data-suffix` (opcional, default ''): sufijo concatenado a cada
    //     frame (e.g. "+" para «600+»). Pasa transparente para el SVG
    //     KPI text que no usa suffix.
    //
    // El nodo puede ser HTML (<span>) o SVG (<text>): textContent funciona
    // en ambos sin distinción.
    //
    // Default duration 1500ms: alineado con la decisión consciente de
    // contador.js de exceder rango spec §9.2 (800-1200ms entradas grandes)
    // para dar tiempo de lectura al usuario; la curva easeOutCubic
    // descelera en los últimos ~400ms.
    // -------------------------------------------------------------------

    var DEFAULT_DURATION_MS = 1500;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Guard común: KPIs sin `data-target` (e.g. F1 cleanup placeholder
    // «—» hasta que el primer caso de éxito real aporte métricas) son
    // no-op. El nodo conserva su `textContent` actual y NO se marca
    // counted, para que el día que se rellene el atributo, el animate
    // arranque limpio sin reset manual.
    function _hasTarget(node) {
        var raw = node.getAttribute('data-target');
        return raw !== null && raw !== '';
    }

    function paintFinal(node) {
        if (!_hasTarget(node)) return;
        var target = parseInt(node.getAttribute('data-target'), 10);
        var suffix = node.getAttribute('data-suffix') || '';
        node.textContent = target + suffix;
        node.setAttribute('data-counted', 'true');
    }

    function animate(node, durationMs) {
        if (node.getAttribute('data-counted') === 'true') return;
        if (!_hasTarget(node)) return;
        var target = parseInt(node.getAttribute('data-target'), 10);
        var startRaw = node.getAttribute('data-start');
        var start = (startRaw !== null && startRaw !== '') ? parseInt(startRaw, 10) : 0;
        var suffix = node.getAttribute('data-suffix') || '';
        var duration = durationMs || DEFAULT_DURATION_MS;
        var delta = target - start;
        var startTime = null;

        function step(now) {
            if (!startTime) startTime = now;
            var elapsed = now - startTime;
            var t = Math.min(1, elapsed / duration);
            var current = Math.round(start + delta * easeOutCubic(t));
            node.textContent = current + suffix;
            if (t < 1) {
                window.requestAnimationFrame(step);
            } else {
                node.setAttribute('data-counted', 'true');
            }
        }
        window.requestAnimationFrame(step);
    }

    return {
        paintFinal: paintFinal,
        animate: animate,
        DEFAULT_DURATION_MS: DEFAULT_DURATION_MS,
    };
});
