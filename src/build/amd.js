'use strict';
(function (factory) {
    if (typeof exports === 'object') {

        var _ = require('underscore');
        var Backbone = require('backbone');

        module.exports = factory(_, Backbone);

    } else if (typeof define === 'function' && define.amd) {

        define(['underscore', 'jquery', 'backbone'], factory);

    }
}(function (_, Backbone) {

// @include minionette.js
    return Minionette;

}));
