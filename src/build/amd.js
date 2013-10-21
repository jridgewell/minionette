(function (factory) {
    'use strict';
    if (typeof exports === 'object') {

        var _ = require('underscore');
        var $ = require('jquery');
        var Backbone = require('backbone');

        module.exports = factory(_, $, Backbone);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore', 'jquery', 'backbone'], factory);

    }
}(function (_, $, Backbone) {
    'use strict';

// @include minionette.js
    return Minionette;

}));
