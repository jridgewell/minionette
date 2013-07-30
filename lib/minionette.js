var Minionette = (function(global, _, $, Backbone) {
    'use strict';

    // Define and export the Minionette namespace
    var Minionette = {};
    Backbone.Minionette = Minionette;

    // Force jQuery to emit remove events.
// Our views bind to it to see if they
// have been removed and should be cleaned.
(function($) {
    if (!$) { return; }
    var _cleanData = $.cleanData,
        testElement = $('<span />'),
        shouldWrap = true;

    // Check to see if jQuery already
    // fires a 'remove' event. If it does,
    // then don't wrap #cleanData.
    testElement.on('remove', function() {
        shouldWrap = false;
    });
    testElement.remove();

    if (shouldWrap) {
        $.cleanData = function(elems) {
            _.each(elems, function(elem) {
                try {
                    $(elem).triggerHandler('remove');
                } catch(e) {}
            });
            _cleanData(elems);
        };
    }
})(jQuery);


    Minionette.Region = function(options) {
    // Setup a unique id for this region.
    // Not really necessary, but it doesn't hurt.
    this.cid = _.uniqueId('subview');

    // Use the view specified at instantiation.
    if (options && options.view) { this.view = options.view; }

    // Make sure we have a view.
    this._ensureView();
};

// Allow Regions to be extended.
// Backbone's extend is generic, just copy it over.
Minionette.Region.extend = Backbone.View.extend;

_.extend(Minionette.Region.prototype, Backbone.Events, {
    // The place holder view's class
    _View: Backbone.View.extend({
        // Set it to a span, so when it's empty it's
        // collapsed on the DOM.
        tagName: 'span',
        // Use the data-cid attribute as a unique
        // attribute. Used for reattaching a detached view.
        attributes: function() {
            return {'data-cid': this.cid};
        }
    }),

    // Ensures the region has a view.
    _ensureView: function() {
        // Instantiate our place holder view.
        this._view = new this._View();

        // Make sure the view is an instance of Backbone.View
        // (or a subclass). If not, set the view to our place holder
        // view.
        if (!(this.view instanceof Backbone.View)) {
            this.view = this._view;
        }

        // And set our view's _parent to this region.
        this._assignParent(this.view);
    },

    // A helper method to reset the region's view to the
    // place holder view.
    reset: function() {
        this.attach(this._view);
    },

    // A proxy method to the view's render().
    render: function() {
        return this.view.render();
    },

    // Attaches newView. This sets newView#$el
    // at the same index (inside the parent element)
    // as the old view, and detaches the old view.
    attach: function(newView) {
        this._assignParent(newView);

        // Places newView after the current view.
        this.view.$el.after(newView.$el);
        // And detaches the view.
        this.view.$el.detach();

        this.view = newView;

        return newView;
    },

    // Replaces the old view with the place holder
    // view.
    remove: function() {
        var oldView = this.view;

        this.reset();
        oldView.remove();

        return oldView;
    },

    // Detaches the current view, replacing it with
    // the place holder. Convenient for detaching
    // during rendering.
    detach: function() {
        // Store the current view for later reattaching.
        this._detachedView = this.view;
        this.reset();

        return this;
    },

    // Reattaches the detached view.
    reattach: function() {
        if (!this._detachedView) { return; }

        // $context is a scoped context in which to search
        // for the current view's element in.
        var $context = (this._parent && this._parent.$el) || Backbone.$(document.body),
            viewSelector = '[data-cid=' + this.view.cid + ']',
            newView = this._detachedView;

        // We then replace the current view with the detached view.
        $context.find(viewSelector).replaceWith(newView.$el);

        delete this._detachedView;
        this.view = newView;

        return newView;
    },

    // A hook method that is called during
    // a view#remove(). Allows a view to be removed,
    // replacing it with the place holder.
    _removeView: function(view) {
        if (this.view === view) {
            this.reset();
        }
    },

    // Sets view#_parent to this region.
    // So view#remove() can hook into our
    // _removeView().
    _assignParent: function(view) {
        view._parent = this;
    }
});

    Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        this._initializeRegions(options || {});

        _.bindAll(this, '_jqueryRemove', '_viewHelper');
        Backbone.View.apply(this, arguments);

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));
    },

    // The Region class to create new regions from.
    Region: Minionette.Region,

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template: function() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serializeData: function() {
        return {};
    },

    // The actual "serializeData" that is fed into the this.template.
    // Used so a subclass can override this.serializeData and still
    // have the `view` helper.
    _serializeData: function() {
        return _.extend({view: this._viewHelper}, this.serializeData());
    },

    // When delegating events, bind this view to jQuery's special remove event.
    // Allows us to clean up the view, even if you remove this.$el with jQuery.
    // http://blog.alexmaccaw.com/jswebapps-memory-management
    delegateEvents: function() {
        Minionette.View.__super__.delegateEvents.apply(this, arguments);

        this.$el.on('remove.delegateEvents' + this.cid, this._jqueryRemove);
    },

    // A useful remove method to that triggers events.
    remove: function() {
        if (!this._isRemoving) {
            this._isRemoving = true;
            this.trigger('remove:before');

            this._removeFromParent();
            _.invoke(this._regions, 'remove');

            Minionette.View.__super__.remove.apply(this, arguments);

            this.trigger('remove');
        }
    },

    // A useful default render method.
    render: function() {
        this.trigger('render:before');

        // Detach all our regions, so they don't need to be re-rendered.
        _.invoke(this._regions, 'detach');

        this.$el.html(this.template(this._serializeData()));

        // Reattach all our regions
        _.invoke(this._regions, 'reattach');

        this.trigger('render');
        return this;
    },

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions[name], for
    // internal management.
    addRegion: function(name, view) {
        var region = new this.Region({view: view});

        region._parent = this;
        this[name] = this._regions[name] = region;

        return region;
    },

    // A remove helper to remove this view from it's parent
    _removeFromParent: function() {
        if (this._parent && this._parent._removeView) {
            this._parent._removeView(this);
            this._parent = null;
        }
    },

    // A proxy method to #remove()
    // Done so we don't _.bindall() to
    // #remove()
    _jqueryRemove: function() {
        this.trigger('remove:jquery');
        this.remove();
    },

    // Loop through the events given, and listen to
    // entity's event.
    _listenToEvents: function(entity, events) {
        if (!entity) { return; }
        _.each(events, function(method, event) {
            if (!_.isFunction(method)) { method = this[method]; }
            this.listenTo(entity, event, method);
        }, this);
    },

    // Takes the #regions object and creates the regions,
    // using the keys as the name and the values as the original
    // view. Keys are all that is required, passing in a false-y
    // value will make Region use a placeholder span element.
    _initializeRegions: function(options) {
        // Initialize our regions object
        this._regions = {};

        // Pull regions from instantiated options.
        var regions = _.result(this, 'regions');
        if (options.regions) { regions = options.regions; }

        // Add the regions
        _.each(regions, function(view, name) {
            this.addRegion(name, view);
        }, this);
    },

    // A helper that is passed to #template() that will
    // render regions inline.
    _viewHelper: function(view) {
        var region = this._regions[view];
        if (region) {
            return region.render().el.outerHTML;
        }
        return '';
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
        return this.model.attributes;
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

        // Dump all our modelViews.
        // They will be removed by the jQuery#remove
        // listener when we clear $el
        this._modelViews = {};
        // Collect the ModelView class.
        var ModelView = this._getModelView();


        var $el = this.$el.html(this.template(this._serializeData()));
        // Use a DocumentFragment to speed up #render()
        this.$el = $(document.createDocumentFragment());

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

        var view = this._findModelViewByModel(model);
        if (view) { view.remove(); }

        this.trigger('removeOne');
        return view;
    },

    // Add an individual model's view to this.$el.
    _addModelView: function(model, ModelView) {
        var modelView = new ModelView({model: model});

        // Add the modelView, and keep track of it.
        this._modelViews || (this._modelViews = {});
        this._modelViews[modelView.cid] = modelView;
        modelView._parent = this;

        this.$el.append(modelView.render().$el);
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

    // Find the view associated with a model from our modelViews.
    _findModelViewByModel: function(model) {
        return _.findWhere(this._modelViews, {model: model});
    }
});


    return Minionette;
})(this, _, jQuery, Backbone);
