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
