Minionette.Region = function(options) {
    options = options || {};
    // Setup a unique id for this region.
    // Not really necessary, but it doesn't hurt.
    this.cid = _.uniqueId('r');
    this.name = options.name;

    // Make sure we have a view.
    this._setView(options);
};

// Allow Regions to be extended.
// Backbone's extend is generic, just copy it over.
Minionette.Region.extend = Backbone.View.extend;

_.extend(Minionette.Region.prototype, Backbone.Events, {
    PlaceholderView: Backbone.View.extend({
        initialize: function(options) {
            this.selector = _.result(options, 'selector') || this.selector;
        },

        selector: function() {
            return this.tagName + '[data-cid="' + this.cid + '"]';
        },

        // Use a span so it collapses on the DOM.
        tagName: 'span',
        // Use the data-cid attribute as a unique
        // attribute. Used for reattaching a detached view.
        attributes: function() {
            return { 'data-cid': this.cid };
        }
    }),

    // An override-able method to construct a new
    // placeholder view.
    buildPlaceholderView: function(options) {
        return new this.PlaceholderView(options);
    },

    // Ensures the region has a view.
    _setView: function(options) {
        this._view = this.buildPlaceholderView(options);

        this.view = options.view || this._view;

        // And set our views' _parent to this region.
        this._view._parent = this.view._parent = this;
    },

    // Ensures that the view's el is contained inside the parent view's.
    _ensureElement: function(view) {
        var $context = _.result(this._parent, '$el');
        var $el = view.$el;

        // Don't reset the view's $el if it is contained
        // in the parent's $el.
        if (!$el.closest($context).length) {
            $el = Backbone.$(_.result(view, 'selector'), $context);
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

        this.trigger('detach', oldView, this);
        this.trigger('attach', newView, this);

        this.view = newView;
        newView._parent = this;

        // Remove the old _detachedView, if it exists
        _.result(this._detachedView, 'remove');
        delete this._detachedView;

        newView.listenTo(this, 'remove', function() {
            this.trigger('remove', this);
            // TODO need to figure out a better way to do this.
            // Trying to avoid a second "remove" event when
            // #remove is actually called.
            this.off('remove');
        });
        oldView.stopListening(this, 'remove');

        // Let's not do any DOM manipulations if
        // the elements are the same.
        if (!$current.is(newView.$el)) {
            // Places newView after the current view.
            newView.$el.insertAfter($current);

            // And detaches the view.
            // Remove the view, unless we are only detaching.
            if (detach) { $current.detach(); }
            else { oldView.remove(); }
        }

        this.trigger('detached', oldView, this);
        this.trigger('attached', newView, this);

        return this;
    },

    // Removes this region, and it's view.
    remove: function() {
        this.trigger('remove', this);

        this._removeFromParent();
        this._removeViews();
        this.stopListening();

        this.trigger('removed', this);
        return this;
    },

    // A remove helper to remove all the regions possible
    // view references.
    _removeViews: function() {
        // Prevent an extra reflow from resetting
        var view = this.view;
        delete this.view;

        view.remove();
        this._view.remove();
        // Remove the _detachedView, if it exists
        _.result(this._detachedView, 'remove');
    },

    // A remove helper to remove this region from it's parent
    // view.
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
            this.reset(true);

            // Store the current view for later reattaching.
            this._detachedView = view;
        }

        return this;
    },

    // Reattaches the detached view.
    reattach: function() {
        // After a render, #view references an element that is
        // not really in the parent. Reattach #view to it.
        this._ensureElement(this.view);

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
        if (this.view === view && view !== this._view) {
            this.reset(true);
        }
    }
});
