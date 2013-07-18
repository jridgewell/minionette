// Backbone.Minionette
// -------------------
// v0.1.0
//
// Copyright (c)2013 Justin Ridgewell
// Distributed under MIT license
//
// https://github.com/jridgewell/minionette

(function (root, factory) {
  if (typeof exports === 'object') {

    var underscore = require('underscore');
    var jQuery = require('jquery');
    var backbone = require('backbone');

    module.exports = factory(underscore, jQuery, backbone);

  } else if (typeof define === 'function' && define.amd) {

    define(['underscore', 'jquery', 'backbone'], factory);

  }
}(this, function (_, jQuery, Backbone) {

  var Minionette = (function(global, _, $, Backbone){
  "use strict";

  // Define and export the Minionette namespace
  var Minionette = {};
  Backbone.Minionette = Minionette;

$.event.special.remove = {
    remove: function(e) {
        if (e.handler) { e.handler(); }
    }
};


Minionette.View = Backbone.View.extend({
    constructor: function() {
        Backbone.View.apply(this, arguments);

        _.bindAll(this, '_jquery_remove');

        this._subViews = {};
        this._bindEntityEvents(this, this.model, this.modelEvents);
        this._bindEntityEvents(this, this.collection, this.collectionEvents);
    },

    template: function() { return ''; },

    delegateEvents: function(events) {
        Backbone.View.prototype.delegateEvents.apply(this, events);
        this.$el.on('remove.delegateEvents' + this.cid, this._jquery_remove);
    },

    close: function() {
        _.each(this._subViews, function(view) { view.close(); });
        this.remove();
    },


    // Attach a subview to an element in my template
    // selector is a dom selector to assign to
    // view is the subview to assign the selector to
    // replace is a boolean
    //    False (default), set view's $el to the selector
    //    True, replace the selector with view's $el
    // Alternate syntax by passing in an object for selector
    //    With "selector": subview
    //    Replace will be the second param in this case.
    assign : function (selector, view, replace) {
        var selectors;
        if (_.isObject(selector)) {
            selectors = selector;
            replace = view;
        } else {
            selectors = {};
            selectors[selector] = view;
        }
        if (!selectors) { return; }

        _.each(selectors, function (view, selector) {
            this._subViews[view.cid] = view;
            if (replace) {
                this.$(selector).replaceWith(view.el);
            } else {
                view.setElement(this.$(selector)).render();
            }
        }, this);
    },

    _jquery_remove: function() {
        this.close();
    },

    _bindEntityEvents: function(target, entity, events) {
        for (var event in events) {
            var method = events[event];
            if (!_.isFunction(method)) { method = this[method]; }
            if (!method) { continue; }

            target.listenTo(entity, event, method);
        }
        return this;
    }
});

Minionette.ModelView = Minionette.View.extend({
    serializeData: function() {
        return this.model.attributes;
    },

    render: function() {
        _.each(this._subViews, function(view) { view.$el.detach(); });

        this.$el.html(this.template(this.serializeData()));

        this.attachSubViews();

        return this;
    },

    attachSubViews: function() {}
});

Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        Minionette.View.apply(this, arguments);
        this._listenEvents();
    },

    setElement: function() {
        Minionette.View.prototype.setElement.apply(this, arguments);
        this.$whereToAdd = this.$(this.options.whereToAdd)[0] ||
            this.$(this.whereToAdd)[0] || this.$el;
    },

    render: function() {
        this.$el.html(this.template(this.collection));
        var ModelView = this._getModelView();

        this.collection.each(function(model) {
            this._addModelView(model, ModelView);
        }, this);

        return this;
    },

    addOne: function(model) {
        var ModelView = this._getModelView();
        this._addModelView(model, ModelView);
    },

    removeOne: function(model) {
        var view = this._findSubViewByModel(model);
        this._removeModelView(view);
    },

    _addModelView: function(model, ModelView) {
        var modelView = new ModelView({model: model});
        this._subViews[modelView.cid] = modelView;
        this.$whereToAdd.append(modelView.render().el);
    },

    _getModelView: function() {
        var ModelView = this.ModelView;
        if (this.options && this.options.ModelView) {
            ModelView = this.option.ModelView;
        }
        return ModelView;
    },

    _listenEvents: function() {
        if (this.collection){
            this.listenTo(this.collection, "add", this.addOne, this);
            this.listenTo(this.collection, "remove", this.removeOne, this);
            this.listenTo(this.collection, "reset", this.render, this);
        }
    },

    _removeModelView: function(view) {
        if (view) {
            view.close();
            delete this._subViews[view.cid];
        }
    },

    _findSubViewByModel: function(model) {
        return _.findWhere(this._subViews, {model: model});
    }
});


  return Minionette;
})(this, _, jQuery, Backbone);

  return Backbone.Minionette;

}));
