var Minionette = (function(global, _, $, Backbone) {
    'use strict';

    // Define and export the Minionette namespace
    var Minionette = {};
    Backbone.Minionette = Minionette;

    // Force jQuery to emit remove events.
// Our views bind to it to see if they
// have been removed and should be cleaned.
if ($) {
    var _cleanData = $.cleanData;
    $.cleanData = function(elems) {
        _.each(elems, function(elem) {
            try {
                $(elem).triggerHandler('remove');
            } catch(e) {}
        });
        _cleanData(elems);
    };
}


    Minionette.View = Backbone.View.extend({
    constructor: function() {
        Backbone.View.apply(this, arguments);

        // Keep track of our subviews.
        this._subViews = {};

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, this.modelEvents);
        this._listenToEvents(this.collection, this.collectionEvents);
    },

    // The Parent View of this View
    // Defaults to nothing
    _parentView: null,

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template: function() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serializeData: function() { return {}; },

    // When delegating events, bind this view to jQuery's special remove event.
    // Allows us to clean up the view, even if you remove this.$el with jQuery.
    // http://blog.alexmaccaw.com/jswebapps-memory-management
    delegateEvents: function() {
        Backbone.View.prototype.delegateEvents.apply(this, arguments);

        _.bindAll(this, '_jqueryRemove');
        this.$el.on('remove.delegateEvents' + this.cid, this._jqueryRemove);
    },

    // A useful remove method to that triggers events.
    remove: function() {
        this.trigger('remove:before');
        this._removeFromParentView();
        this._removeSubViews();
        Backbone.View.prototype.remove.apply(this, arguments);
        this.trigger('remove');
    },

    // A useful default render method.
    render: function() {
        this.trigger('render:before');

        // Detach all our subviews, so they don't need to be re-rendered.
        _.each(this._subViews, function(view) { view.$el.detach(); });

        this.$el.html(this.template(this.serializeData()));

        // Listen for render events to reattach subviews.
        this.trigger('render');
        return this;
    },

    // Assign a subview to an element in my template.
    // `selector` is a dom selector to assign to.
    // `view` is the subview to assign the selector to.
    // `replace` is a boolean.
    //    `False` (default), set view's $el to the selector.
    //    `True`, replace the selector with view's $el.
    // Alternate syntax by passing in an object for selector.
    //    With "selector": subview
    //    Replace will be the second param in this case.
    assign: function (selector, view, replace) {
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
            view._parentView = this;
            if (replace) {
                this.$(selector).replaceWith(view.el);
            } else {
                view.setElement(this.$(selector)).render();
            }
        }, this);
    },

    // A remove helper to remove this view from it's parent
    _removeFromParentView: function() {
        if (this._parentView) {
            this._parentView._removeSubView(this);
        }
    },

    _removeSubView: function(subView) {
        delete this._subViews[subView.cid];
    },

    // A remove helper to clear our subviews.
    _removeSubViews: function() {
        _.invoke(this._subViews, 'remove');
    },

    // Does the same thing as this.remove(), without
    // actually removing the element. Done to prevent
    // us from removing an element that is already removed.
    _jqueryRemove: function() {
        this.trigger('remove:jquery');
        this._removeFromParentView();
        this.stopListening();
    },

    // Loop through the events given, and listen to
    // entity's event.
    _listenToEvents: function(entity, events) {
        if (!entity) { return; }
        for (var event in events) {
            var method = events[event];
            if (!_.isFunction(method)) { method = this[method]; }
            if (!method) { continue; }

            this.listenTo(entity, event, method);
        }
        return this;
    }
});

    Minionette.ModelView = Minionette.View.extend({
    // Listen to the default events
    modelEvents: {
        'change': 'render',
        'destroy': 'remove'
    },

    // The data that is sent into the template function.
    // Override this to provide custom data.
    serializeData: function() {
        return _.clone(this.model.attributes);
    }
});

    Minionette.CollectionView = Minionette.View.extend({

    // The View class to render the collection as.
    ModelView: Backbone.View,

    // Listen to the default events.
    collectionEvents: {
        'add': 'addOne',
        'remove': 'removeOne',
        'reset': 'render',
        'sort': 'render'
    },

    // A default useful render function.
    render: function() {
        this.trigger('render:before');

        var $el = this.$el.html(this.template(this.serializeData()));
        // Use a DocumentFragment to speed up #render
        this.$el = $(document.createDocumentFragment());

        // Collect the ModelView class.
        var ModelView = this._getModelView();

        // Loop through all our models, and build their view.
        this.collection.each(function(model) {
            this._addModelView(model, ModelView);
        }, this);

        // Append the DocumentFragment to the rendered template,
        // and set that as this.$el
        this.$el = $el.append(this.$el);

        this.trigger('render');
        return this;
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        this.trigger('addOne:before');

        // Collect the ModelView class.
        var ModelView = this._getModelView(),
            view = this._addModelView(model, ModelView);

        this.trigger('addOne');
        return view;
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        this.trigger('removeOne:before');

        var view = this._findSubViewByModel(model);
        if (view) { view.remove(); }

        this.trigger('removeOne');
        return view;
    },

    // Add an individual model's view to this.$el.
    _addModelView: function(model, ModelView) {
        var modelView = new ModelView({model: model});

        // Add this view to our subviews, so we can remove
        // them later.
        this._subViews[modelView.cid] = modelView;
        modelView._parentView = this;

        this.$el.append(modelView.render().el);
        return modelView;
    },

    // Find the correct ModelView to use.
    // Prioritizes the one passed at initialization.
    _getModelView: function() {
        var ModelView = this.ModelView;
        if (this.options && this.options.ModelView) {
            ModelView = this.options.ModelView;
        }
        return ModelView;
    },

    // Find the view associated with a model from our subviews.
    _findSubViewByModel: function(model) {
        return _.findWhere(this._subViews, {model: model});
    }
});


    return Minionette;
})(this, _, jQuery, Backbone);
