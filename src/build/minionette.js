(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone'], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('underscore'), require('backbone'));
  } else {
    root.Minionette = factory(root._, root.Backbone);
  }
})(this, function(_, Backbone) {
    'use strict';

    // Define and export the Minionette namespace
    var Minionette = Backbone.Minionette = {};

    // @include ../attempt.js
    // @include ../model.js
    // @include ../region.js
    // @include ../view.js
    // @include ../model_view.js
    // @include ../collection_view.js
    // @include ../router.js
    // @include ../computed.js
    // @include ../trigger.js

    return Minionette;
});
