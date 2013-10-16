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

var Minionette = (function(global, _, $, Backbone) {
    'use strict';

    // Define and export the Minionette namespace
    var Minionette = {};
    Backbone.Minionette = Minionette;

// A helper function, similar to Rails' `try`,
// the will call the method on obj, unless obj
// is undefined or null. Passes the 3rd+ params
// as arguments to the method
function attempt(obj, method) {
    // Return undefined unless obj
    // is not null or undefined
    if (obj == null) { return void 0; }

    // Grab the 3rd+ params
    var args = _.rest(arguments, 2);

    if (_.isFunction(obj[method])) {
        // Call the method, as obj, with the
        // additional params
        return obj[method].apply(obj, args);
    }
}


Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        options = options || {};

        // Ensure we have a Region to initialize
        // new regions from.
        this._ensureRegion(options);
        this._initializeRegions(options);

        Backbone.View.apply(this, arguments);

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));

        // Always bind this._viewHelper to this.
        // This._viewHelper will be passed into
        // the template as a helper method for
        // rendering regions.
        _.bindAll(this, '_viewHelper');
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

    // A useful remove method that triggers events.
    remove: function() {
        if (this._isRemoving) { return; }
        this._isRemoving = true;
        this.trigger('remove', this);

        this._removeFromParent();
        _.invoke(this._regions, 'remove');

        Minionette.View.__super__.remove.apply(this, arguments);

        this.trigger('removed', this);
        this.unbind();
    },

    // A useful default render method.
    render: function() {
        this.trigger('render', this);

        // Detach all our regions, so they don't need to be re-rendered.
        _.invoke(this._regions, 'detach');

        this.$el.html(this.template(this._serialize()));

        // Reattach all our regions
        _.invoke(this._regions, 'reattach');

        this.trigger('rendered', this);
        return this;
    },

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions[name], for
    // internal management.
    addRegion: function(name, view) {
        // Remove the old region, if it exists already
        attempt(this._regions[name], 'remove');

        var options = {};
        // If view is a selector, find the DOM element
        // that matches it.
        if (_.isString(view)) {
            options.el = this.$(view);
            options.el.selector = view;
        } else {
            options.view = view;
        }

        var region = new this.Region(options);

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
        // Remove this view from _parent, if it exists
        attempt(this._parent, '_removeView', this);
    },

    _removeRegion: function(region) {
        delete this[region.name];
        delete this._regions[region.name];
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
        var regions = _.result(options, 'regions') || _.result(this, 'regions');

        // Add the regions
        this.addRegions(regions);
    },

    // A helper that is passed to #template() that will
    // render regions inline.
    _viewHelper: function(view) {
        var region = this._regions[view];
        if (region && region.render().el) {
            return region.view.el.outerHTML;
        }
        return '';
    }
});

Minionette.Region = function(options) {
    // Setup a unique id for this region.
    // Not really necessary, but it doesn't hurt.
    this.cid = _.uniqueId('region');

    // Make sure we have a view.
    this._ensureView(options || {});
};

function getParentViewContext(view) {
    return _.result(view._parent, '$el') || Backbone.$();
}

// Allow Regions to be extended.
// Backbone's extend is generic, just copy it over.
Minionette.Region.extend = Backbone.View.extend;

_.extend(Minionette.Region.prototype, Backbone.Events, {
    // Ensures the region has a view.
    _ensureView: function(options) {
        var viewOpts = {
            // Grab the el from options.
            // This will override the following if it exists.
            el: options.el,
            // If not, set it to a span so when it's
            // empty it's collapsed on the DOM.
            tagName: 'span',
            // Use the data-cid attribute as a unique
            // attribute. Used for reattaching a detached view.
            attributes: function() {
                return {'data-cid': this.cid};
            }
        };

        this._view = new Backbone.View(viewOpts);
        this._view.$el.selector = this._view.$el.selector ||
            '[data-cid=' + this._view.cid + ']';

        this.view = options.view || this._view;

        // And set our view's _parent to this region.
        this._assignParent(this.view);
    },

    _ensureElement: function(view) {
        var $context = getParentViewContext(this),
            viewSelector = view.$el.selector;
        view.setElement($context.find(viewSelector));
    },

    // Resets the region's view to placeholder view.
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
        var oldView = this.view;

        // Remove the old _detachedView, if it exists
        attempt(this._detachedView, 'remove');
        delete this._detachedView;

        this._assignParent(newView);

        // Places newView after the current view.
        oldView.$el.after(newView.$el);
        // And detaches the view.
        oldView.$el.detach();

        this.view = newView;

        // Remove the view, unless we are only detaching.
        if (!detach) { oldView.remove(); }

        return newView;
    },

    // Removes this region, and it's view.
    remove: function() {
        this.trigger('remove', this);
        this._removeViews();
        this._removeFromParent();
        this.stopListening();
    },

    _removeViews: function() {
        this.view.remove();
        this._view.remove();
        // Remove the _detachedView, if it exists
        attempt(this._detachedView, 'remove');
    },

    _removeFromParent: function() {
        // Remove this region from its parent, if it exists
        attempt(this._parent, '_removeRegion', this);
        this._parent = null;
    },

    // Detaches the current view, replacing it with
    // the placeholder. Convenient for detaching
    // during rendering.
    detach: function() {
        var view = this.view;
        if (view !== this._view) {
            this.reset(true);

            // Store the current view for later reattaching.
            this._detachedView = view;
        }

        return this;
    },

    // Reattaches the detached view.
    reattach: function() {
        if (!this._view.el) { this._ensureElement(this._view); }
        // $context is a scoped context in which to search
        // for the current view's element in.
        var $context = getParentViewContext(this),
            viewSelector = this.view.$el.selector,
            newView = this._detachedView || this._view;

        // We then replace the current view with the detached view.
        $context.find(viewSelector).replaceWith(newView.$el);

        delete this._detachedView;
        this.view = newView;

        return newView;
    },

    // A hook method that is called during
    // a view#remove(). Allows a view to be removed,
    // replacing it with the placeholder.
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
        change: 'render',
        destroy: 'remove'
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

        // Augment #render() with our collection specific items.
        this.on('rendered', this._renderCollectionViews);
        // Make sure we remove our modelViews when this is removed.
        this.on('remove', this._removeModelViews);
    },

    // Listen to the default events.
    collectionEvents: {
        add: 'addOne',
        remove: 'removeOne',
        reset: 'render',
        sort: 'render'
    },

    // A default useful render function.
    render: function() {
        // Remove all our modelViews after the 'render' event is
        // fired. This is set on #render() so that the removing
        // will happen after all other 'render' listeners.
        this.once('render', this._removeModelViews());

        return Minionette.CollectionView.__super__.render.apply(this);
    },

    _renderCollectionViews: function() {
        // Use a DocumentFragment to speed up #render()
        var frag = $(document.createDocumentFragment());

        var appendHtml = this.appendHtml;
        this.appendHtml = function(element) { frag.append(element); };

        // Loop through all our models, and build their view.
        this.collection.each(this.addOne, this);

        // Append the DocumentFragment to the rendered template,
        // and set that as this.$el
        this.appendHtml = appendHtml;
        this.appendHtml(frag);
    },

    appendHtml: function(elements) {
        this.$el.append(elements);
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        var view = new this.ModelView({model: model});

        // Add the modelView, and keep track of it.
        this._modelViews[view.cid] = view;
        view._parent = this;

        this.trigger('addOne', view, this);

        this.appendHtml(view.render().$el);

        this.trigger('addedOne', view, this);

        return view;
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        // This may or may not find a view.
        var view = _.findWhere(this._modelViews, {model: model});

        if (view) {
            this.trigger('removeOne', view, this);
            view.remove();
            this.trigger('removedOne', view, this);
        }

        return view;
    },

    // A hook method that is called during
    // a view#remove().
    _removeView: function(view) {
        delete this._modelViews[view.cid];
    },

    // A callback method bound to the 'remove:before'
    // event. Removes all our modelViews.
    _removeModelViews: function() {
        // Empty the entire $el, that way each individual
        // modelView removal won't trigger a DOM reflow.
        this.$el.empty();
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

    return Backbone.Minionette;

}));
