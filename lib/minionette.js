'use strict';
var Minionette = (function(_, Backbone) {

    // Define and export the Minionette namespace
    var Minionette = Backbone.Minionette = {};

    // A helper function, similar to _.result
    // that will return the property on obj, unless obj
    // is undefined or null. Passes the 3rd+ params
    // as arguments to the property, if it is a method
    var slice = Array.prototype.slice;
    function attempt(obj, property) {
        // Return undefined unless obj
        // is not null or undefined
        if (obj == null) { return void 0; }
        var prop = obj[property];

        if (typeof prop === 'function') {
            // Grab the 3rd+ params
            var args = slice.call(arguments, 2);

            // Call the method, as obj, with the
            // additional params
            return prop.apply(obj, args);
        }
        return prop;
    }

    Minionette.Region = function(options) {
        options = options || {};
        // Setup a unique id for this region.
        // Not really necessary, but it doesn't hurt.
        this.cid = options.cid;

        // Make sure we have a view.
        this._ensureView(options);
    };

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
            this._view._selector = options.selector || '[data-cid=' + this._view.cid + ']';

            this.view = options.view || this._view;

            // And set our view's _parent to this region.
            this.view._parent = this;
        },

        _ensureElement: function(view) {
            var $context = _.result(this._parent, '$el') || Backbone.$(),
                $el;

            // Don't reset the view's $el if the parent
            // context is the same.
            if (!view.$el.parent().is($context)) {
                $el = $context.find(view._selector);
                view.setElement($el);
            }
        },

        // Resets the region's view to placeholder view.
        // Optionally takes a boolean, in which case the
        // oldView will just be detached.
        reset: function(detach) {
            this.attach(this._view, detach);
            return this;
        },

        // A proxy method to the view's render().
        render: function() {
            return this.view.render();
        },

        // Attaches newView. This sets newView#$el
        // at the same index (inside the parent element)
        // as the old view, and removes the old view.
        attach: function(newView, detach) {
            var oldView = this.view,
                $current = oldView.$el;

            this.trigger('attach', newView, this);

            this.view = newView;
            newView._parent = this;

            // Remove the old _detachedView, if it exists
            attempt(this._detachedView, 'remove');
            delete this._detachedView;

            // Let's not do any DOM manipulations if
            // the elements are the same.
            if (!$current.is(newView.$el)) {
                // Places newView after the current view.
                newView.$el.insertAfter($current);

                // And detaches the view.
                $current.detach();
                // Remove the view, unless we are only detaching.
                if (!detach) { oldView.remove(); }
            }

            this.trigger('attached', newView, this);

            return this;
        },

        // Removes this region, and it's view.
        remove: function() {
            this.trigger('remove', this);

            this._removeViews();
            this._removeFromParent();
            this.stopListening();

            this.trigger('removed', this);
            return this;
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
        },

        // Detaches the current view, replacing it with
        // the placeholder. Convenient for detaching
        // during rendering.
        detach: function() {
            var view = this.view;
            if (view !== this._view) {
                this.trigger('detach', view, this);
                this.reset(true);

                // Store the current view for later reattaching.
                this._detachedView = view;
                this.trigger('detached', view, this);
            }

            return this;
        },

        // Reattaches the detached view.
        reattach: function() {
            // After a render, #_view references an element that is
            // not really in the parent. Reattach #_view to it.
            this._ensureElement(this._view);

            // If there's not a detached view, stop!
            if (!this._detachedView) { return; }

            // Grab the #_detachedView
            var newView = this._detachedView;
            // And make sure we don't remove the detached view while
            // attaching.
            delete this._detachedView;

            this.trigger('reattach', newView, this);

            // Attach our old view!
            this.attach(newView, true);
            this.trigger('reattached', newView, this);

            return newView;
        },

        // A hook method that is called during
        // a view#remove(). Allows a view to be removed,
        // replacing it with the placeholder.
        _removeView: function(view) {
            if (this.view === view) { this.reset(true); }
        }
    });

    Minionette.View = Backbone.View.extend({
        constructor: function(options) {
            // Pick out a few initializing options
            _.extend(this, _.pick(options || {}, 'regions', 'Region', 'template'));

            // Initialize our regions object
            this._regions = {};

            Backbone.View.apply(this, arguments);

            // Add the regions
            // This is done _after_ calling Backbone.View's constructor,
            // so that this.$el will be defined when we bind selectors.
            this.addRegions(attempt(this, 'regions'));

            // Have the view listenTo the model and collection.
            this._listenToEvents(this.model, attempt(this, 'modelEvents'));
            this._listenToEvents(this.collection, attempt(this, 'collectionEvents'));

            // Always bind this._viewHelper to this.
            // This._viewHelper will be passed into
            // the template as a helper method for
            // rendering regions.
            _.bindAll(this, '_viewHelper');
        },

        Region: Minionette.Region,

        // A default template that will clear this.$el.
        // Override this in a subclass to something useful.
        template: function() { return ''; },

        // A default function that will have it's return passed
        // to this.template
        // Override this in a subclass to something useful.
        serialize: function() { return {}; },

        // The actual "serialize" that is fed into the this.template.
        // Used so a subclass can override this.serialize and still
        // have the `view` helper.
        _serialize: function() {
            return _.extend({view: this._viewHelper}, this.serialize());
        },

        // A useful remove method that triggers events.
        remove: function() {
            this.trigger('remove', this);

            this._removeFromParent();
            _.invoke(this._regions, 'remove');
            Minionette.View.__super__.remove.apply(this, arguments);

            this.trigger('removed', this);
            return this;
        },

        // A useful default render method.
        render: function() {
            this.trigger('render', this);

            // Detach all our regions, so they don't need to be re-rendered.
            _.invoke(this._regions, 'detach');

            this.$el.html(attempt(this, 'template', this._serialize()));

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

            var options = { cid: name };
            // If this is a Backbone.View, pass that as the
            // view to the region.
            if (!view || view.$el) {
                options.view = view;
            } else {
                // If view is a selector, find the DOM element
                // that matches it.
                options.selector = (typeof view === 'object') ? view.selector : view;
                options.el = this.$(view);
            }

            var region = new this.Region(options);

            region._parent = this;
            this[region.cid] = this._regions[region.cid] = region;

            return region;
        },

        // Adds multiple regions to the view. Takes
        // an object with {regioneName: view} syntax
        addRegions: function(regions) {
            _.each(regions, function(view, name) {
                this.addRegion(name, view);
            }, this);
            return this;
        },

        // A remove helper to remove this view from it's parent
        _removeFromParent: function() {
            // Remove this view from _parent, if it exists
            attempt(this._parent, '_removeView', this);
        },

        _removeRegion: function(region) {
            delete this[region.cid];
            delete this._regions[region.cid];
        },

        // Loop through the events given, and listen to
        // entity's event.
        _listenToEvents: function(entity, events) {
            if (!entity) { return; }
            _.each(events, function(method, event) {
                if (typeof method !== 'function') { method = this[method]; }
                this.listenTo(entity, event, method);
            }, this);
        },

        // A helper that is passed to #template() that will
        // render regions inline.
        _viewHelper: function(name) {
            var region = this._regions[name] || this.addRegion(name);
            var el;
            if ((el = region.render().el)) {
                return el.outerHTML;
            }
            return '';
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
            // Initialize a storage object for our modelViews
            this._modelViews = {};

            // Ensure this has a ModelView to initialize
            // new modelViews from.
            this._ensureModelView(options || {});

            Minionette.View.apply(this, arguments);

            // Augment #render() with our collection specific items.
            this.on('rendered', this._renderModelViews);
            // Make sure we remove our modelViews when this is removed.
            this.on('removed', this._removeModelViews);
        },

        // Listen to the default events.
        collectionEvents: {
            add: 'addOne',
            remove: 'removeOne',
            reset: 'render',
            sort: 'render'
        },

        // The prefix that will be put on every event triggered
        // by one of the modelViews. So, if a modelView triggers
        // "event", collectionView will trigger "modelView:event"
        // ("event" -> "modelView:event").
        // A falsey value will cause no prefix (or colon) to be
        // used ("event" -> "event").
        modelViewEventPrefix: 'modelView',

        ModelView: Minionette.ModelView,

        // A default useful render function.
        render: function() {
            // Remove all our modelViews after the 'render' event is
            // fired. This is set on #render() so that the removing
            // will happen after all other 'render' listeners.
            this.once('render', function() {
                // Empty the entire $el, that way each individual
                // modelView removal won't trigger a DOM reflow.
                this.$el.empty();
                this._removeModelViews();
            }, this);

            return Minionette.CollectionView.__super__.render.apply(this);
        },

        _renderModelViews: function() {
            // Use a DocumentFragment to speed up #render()
            var frag = new Backbone.View({el: document.createDocumentFragment()});

            // Override `appendModelView()` for the time being.
            // This is so we can append directly to the DocumentFragment,
            // and then append it all at once later.
            var appendModelView = this.appendModelView;
            this.appendModelView = function(view) { frag.el.appendChild(view.el); };

            // Loop through all our models, and build their view.
            this.collection.each(this.addOne, this);

            // Append the DocumentFragment to the rendered template,
            // and set `appendModelView()` back to normal.
            this.appendModelView = appendModelView;
            this.appendModelView(frag);
        },

        appendModelView: function(view) {
            this.$el.append(view.$el);
        },

        // Add an individual model's view to this.$el.
        addOne: function(model) {
            var view = this.buildModelView(model);

            // Setup event forwarding
            this._forwardEvents(view);

            // Add the modelView, and keep track of it.
            this._modelViews[model.cid] = view;
            view._parent = this;

            this.trigger('addOne', view, this);

            this.appendModelView(view.render());

            this.trigger('addedOne', view, this);

            return view;
        },

        // An override-able method to construct a new
        // modelView.
        buildModelView: function(model) {
            return new this.ModelView({model: model});
        },

        // Remove an individual model's view from this.$el.
        removeOne: function(model) {
            var view = this._modelViews[model.cid];

            if (view) {
                this.trigger('removeOne', view, this);
                view.remove();
                this.trigger('removedOne', view, this);
                this.stopListening(view);
            }

            return view;
        },

        // A hook method that is called during
        // a view#remove().
        _removeView: function(view) {
            delete this._modelViews[view.model.cid];
        },

        // A callback method bound to the 'remove:before'
        // event. Removes all our modelViews.
        _removeModelViews: function() {
            _.invoke(this._modelViews, 'remove');
        },

        // Sets this.ModelView. Prioritizes instantiated options.ModelView,
        // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
        _ensureModelView: function(options) {
            var mv = options.ModelView || this.ModelView || {};
            if (typeof mv !== 'function') {
                mv = Minionette.ModelView.extend(mv);
            }
            this.ModelView = mv;
        },

        // Since CollectionView is meant to be largely automated,
        // setup event forwarding from modelViews. That way,
        // you only need to listen to events that happen on
        // this collectionView, not on all the modelViews.
        _forwardEvents: function(view) {
            this.listenTo(view, 'all', function() {
                var args = slice.call(arguments);
                var prefix = attempt(this, 'modelViewEventPrefix');
                prefix = (prefix) ? prefix + ':' : '';

                args[0] = prefix + args[0];
                args.push(view);

                this.trigger.apply(this, args);
            });
        }
    });


    return Minionette;
})(_, Backbone);
