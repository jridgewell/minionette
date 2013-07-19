(function (root, factory) {
    'use strict';
    if (typeof exports === 'object') {

        var underscore = require('underscore');
        var jQuery = require('jquery');
        var backbone = require('backbone');

        module.exports = factory(underscore, jQuery, backbone);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore', 'jquery', 'backbone'], factory);

    }
}(this, function (_, jQuery, Backbone) {
    'use strict';

    // @include minionette.js
    return Backbone.Minionette;

}));
