Minionette.Region = function(options) {
	options = options || {};
    // Setup a unique id for this region.
    // Not really necessary, but it doesn't hurt.
    this.cid = options.name || _.uniqueId('region');

    // Make sure we have a view.
    this._ensureView(options);
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
        this.view._parent = this;
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

        // Let's not do any DOM manipulations if
        // the elements are the same.
        if (newView.el === oldView.el) { return; }

        // jQuery before 1.9 will do weird things
        // if oldView doesn't have a parent.
        if (oldView.$el.parent().length) {
            // Places newView after the current view.
            oldView.$el.after(newView.$el);
            // And detaches the view.
            oldView.$el.detach();
        }

        this.view = newView;
        newView._parent = this;

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
        // Make sure our `_view` has it's el.
        // It may not depending on whether the region was
        // created with a selector and the parent view hadn't
        // rendered yet.
        if (!this._view.el) { this._ensureElement(this._view); }

        // If this region has a non-placeholder view but it wasn't
        // detached, stop!
        if (!this._detachedView && this.view !== this._view) { return; }

        // $context is a scoped context in which to search
        // for the current view's element in.
        var $context = getParentViewContext(this),
            viewSelector = this.view.$el.selector,
            replace = $context.find(viewSelector),
            newView = this._detachedView || this._view;

        // Don't try to replace an element with itself.
        // It breaks jQuery...
        if (replace[0] === newView.el) { return; }

        // We then replace the current view with the detached view.
        replace.replaceWith(newView.$el);

        delete this._detachedView;
        this.view = newView;

        return newView;
    },

    // A hook method that is called during
    // a view#remove(). Allows a view to be removed,
    // replacing it with the placeholder.
    _removeView: function(view) {
        if (this.view === view) { this.reset(true); }
    },
});
