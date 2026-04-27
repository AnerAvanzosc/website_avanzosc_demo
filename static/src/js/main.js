odoo.define('website_avanzosc_demo.main', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscRoot = publicWidget.Widget.extend({
        selector: '#wrap',
        start: function () {
            // Inicializar Lucide Icons: reemplaza todos los elementos con
            // atributo data-lucide por el SVG correspondiente.
            // La librería CDN lucide.min.js se carga desde <head> vía
            // views/assets.xml (template head_external_assets).
            // Ref: CLAUDE.md §9.7, spec §3.3 punto 2.
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
            }
            return this._super.apply(this, arguments);
        },
    });

    return publicWidget.registry.AvanzoscRoot;
});
