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


    Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        options || (options = {});

        // Ensure we have a Region to initialize
        // new regions from.
        this._ensureRegion(options);
        this._initializeRegions(options);

        _.bindAll(this, '_jqueryRemove', '_viewHelper');
        Backbone.View.apply(this, arguments);

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));
    },

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template: function() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serialize: function() {
        return {};
    },

    // The actual "serialize" that is fed into the this.template.
    // Used so a subclass can override this.serialize and still
    // have the `view` helper.
    _serialize: function() {
        return _.extend({view: this._viewHelper}, this.serialize());
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
            this.trigger('remove');

            this._removeFromParent();
            _.invoke(this._regions, 'remove');

            Minionette.View.__super__.remove.apply(this, arguments);
            delete this._jqueryRemove;
            delete this._viewHelper;

            this.unbind();
        }
    },

    // A useful default render method.
    render: function() {
        this.trigger('render');

        // Detach all our regions, so they don't need to be re-rendered.
        _.invoke(this._regions, 'detach');

        this.$el.html(this.template(this._serialize()));

        // Reattach all our regions
        _.invoke(this._regions, 'reattach');

        return this;
    },

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions[name], for
    // internal management.
    addRegion: function(name, view) {
        var region = new this.Region({view: view});

        region.name = name;
        region._parent = this;
        this[name] = this._regions[name] = region;

        return region;
    },

    // Adds multiple regions to the view. Takes
    // an object with {regioneName: view} syntax
    addRegions: function(regions) {
        _.each(regions, function(view, name) {
            this.addRegion(name, view);
        }, this);
    },

    // A remove helper to remove this view from it's parent
    _removeFromParent: function() {
        if (this._parent && this._parent._removeView) {
            this._parent._removeView(this);
        }
        this._parent = null;
    },

    _removeRegion: function(region) {
        delete this[region.name];
        delete this._regions[region.name];
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

    // Sets this.Region. Prioritizes instantiated options.Region,
    // then a subclass' prototype Region, and defaults to Minionette.Region
    _ensureRegion: function(options) {
        this.Region = options.Region || this.Region || Minionette.Region;
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
        this.addRegions(regions);
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

    Minionette.Region = function(options) {
    // Setup a unique id for this region.
    // Not really necessary, but it doesn't hurt.
    this.cid = _.uniqueId('subview');

    // Make sure we have a view.
    this._ensureView(options || {});
};

// Allow Regions to be extended.
// Backbone's extend is generic, just copy it over.
Minionette.Region.extend = Backbone.View.extend;

_.extend(Minionette.Region.prototype, Backbone.Events, {
    // The place holder view's class
    View: Minionette.View.extend({
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
    _ensureView: function(options) {
        // Instantiate our place holder view.
        this._view = new this.View();

        // Set this.view to instantiated options.view
        // if supplied.
        if (options.view) { this.view = options.view; }

        // Make sure the view is an instance of Backbone.View
        // (or a subclass). If not, set the view to our place holder
        // view.
        if (!(this.view instanceof Backbone.View)) {
            this.view = this._view;
        }

        // And set our view's _parent to this region.
        this._assignParent(this.view);
    },

    // Resets the region's view to place holder view.
    // Optionally takes a boolean, in which case the
    // oldView will just be detached.
    reset: function(detach) {
        this.attach(this._view, detach);
    },

    // A proxy method to the view's render().
    render: function() {
        return this.view.render();
    },

    // Attaches newView. This sets newView#$el
    // at the same index (inside the parent element)
    // as the old view, and removes the old view.
    attach: function(newView, detach) {
        this._assignParent(newView);
        var oldView = this.view;

        // Places newView after the current view.
        this.view.$el.after(newView.$el);
        // And detaches the view.
        this.view.$el.detach();

        this.view = newView;

        // Remove the view
        if (!detach) {
            oldView.remove();
        }

        return newView;
    },

    // Removes this region, and it's view.
    remove: function() {
        this._removeViews();
        this._removeFromParent();
    },

    _removeViews: function() {
        this.view.remove();
        this._view.remove();
        this._detachedView && this._detachedView.remove();
    },

    _removeFromParent: function() {
        if (this._parent && this._parent._removeRegion) {
            this._parent._removeRegion(this);
        }
        this._parent = null;
    },

    // Detaches the current view, replacing it with
    // the place holder. Convenient for detaching
    // during rendering.
    detach: function() {
        // Store the current view for later reattaching.
        this._detachedView = this.view;

        if (this.view !== this._view) {
            this.reset(true);
        }

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
            this.reset(true);
        }
    },

    // Sets view#_parent to this region.
    // So view#remove() can hook into our
    // _removeView().
    _assignParent: function(view) {
        view._parent = this;
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
    serialize: function() {
        return this.model.attributes;
    }
});

    Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        // Initialize a object for our modelViews
        this._modelViews = {};
        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelView(options || {});

        Minionette.View.apply(this, arguments);

        // Make sure we remove our modelViews when this is removed.
        this.listenTo(this, 'remove', this._removeModelViews);
    },

    // Listen to the default events.
    collectionEvents: {
        'add': 'addOne',
        'remove': 'removeOne',
        'reset': 'render',
        'sort': 'render'
    },

    // A default useful render function.
    render: function() {
        this.trigger('render');

        // Dump all our modelViews.
        this._removeModelViews();

        var $el = this.$el.html(this.template(this._serialize()));
        // Use a DocumentFragment to speed up #render()
        this.$el = $(document.createDocumentFragment());

        // Loop through all our models, and build their view.
        this.collection.each(this._addModelView, this);

        // Append the DocumentFragment to the rendered template,
        // and set that as this.$el
        this.$el = $el.append(this.$el);

        return this;
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        this.trigger('addOne');

        var view = this._addModelView(model);

        return view;
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        this.trigger('removeOne');

        var view = _.findWhere(this._modelViews, {model: model});
        if (view) { view.remove(); }

        return view;
    },

    // Add an individual model's view to this.$el.
    _addModelView: function(model) {
        var modelView = new this.ModelView({model: model});

        // Add the modelView, and keep track of it.
        this._modelViews[modelView.cid] = modelView;
        modelView._parent = this;

        this.$el.append(modelView.render().$el);
        return modelView;
    },

    // A hook method that is called during
    // a view#remove().
    _removeView: function(view) {
        delete this._modelViews[view.cid];
    },

    // A callback method bound to the 'remove:before'
    // event. Removes all our modelViews.
    _removeModelViews: function() {
        _.invoke(this._modelViews, 'remove');
    },

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
    _ensureModelView: function(options) {
        this.ModelView = options.ModelView || this.ModelView || Minionette.ModelView;
    }
});


    return Minionette;
})(this, _, jQuery, Backbone);
