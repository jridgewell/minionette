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
    _ensureView: function(options) {
        // Instantiate our place holder view.
        this._view = new this._View();

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

    // Replaces the old view with the place holder
    // view.
    remove: function() {
        var oldView = this.view;

        this.reset();
        oldView.remove();
        delete this._detachedView;

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
            this.remove();
        }
    },

    // Sets view#_parent to this region.
    // So view#remove() can hook into our
    // _removeView().
    _assignParent: function(view) {
        view._parent = this;
    }
});
