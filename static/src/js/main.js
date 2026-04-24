odoo.define('website_avanzosc_demo.main', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');

    publicWidget.registry.AvanzoscRoot = publicWidget.Widget.extend({
        selector: '#wrap',
        start: function () {
            return this._super.apply(this, arguments);
        },
    });

    return publicWidget.registry.AvanzoscRoot;
});
