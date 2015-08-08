import _ from 'underscore';
import Backbone from 'backbone'
import PlaceholderView from './placeholder_view';

export default function Region(options = {}) {
    // Setup a unique id for this region.
    // Not really necessary, but it doesn't hurt.
    this.cid = _.uniqueId('r');
    this.name = options.name;
    this.selector = options.selector;

    // Make sure we have a view.
    this.attach(this.buildPlaceholderView(options));

    this.initialize.apply(this, arguments);
};

// Allow Regions to be extended.
// Backbone's extend is generic, just copy it over.
Region.extend = Backbone.View.extend;

_.extend(Region.prototype, Backbone.Events, {
    PlaceholderView: PlaceholderView,

    initialize: function() {},

    // An override-able method to construct a new
    // placeholder view.
    buildPlaceholderView(options) {
        return new this.PlaceholderView(options);
    },

    // Resets the region's view to placeholder view.
    // Optionally takes a boolean, in which case the
    // oldView will just be detached.
    reset(detach) {
        this.attach(this.buildPlaceholderView({}), detach);
        return this;
    },

    // Attaches newView. This sets newView#$el
    // at the same index (inside the parent element)
    // as the old view, and removes the old view.
    attach(newView, detach) {
        const oldView = this.view;
        const $current = oldView && oldView.$el;

        if (oldView) {
            this.trigger('detach', oldView, this);
            oldView.off('remove', this._removeViewLast, this);
        }

        this.trigger('attach', newView, this);
        newView.on('remove', this._removeViewLast, this);

        this.view = newView;

        // Let's not do any DOM manipulations if
        // the elements are the same.
        if ($current && !newView.$el.is($current)) {
            // Places newView after the current view.
            newView.$el.insertBefore($current);

            // And detaches the view.
            // Remove the view, unless we are only detaching.
            if (detach) { $current.detach(); }
            else { oldView.remove(); }
        }

        if (oldView) { this.trigger('detached', oldView, this); }
        this.trigger('attached', newView, this);

        return this;
    },

    // Ensures that the view's el is contained inside the parent view's.
    _setInContext($context) {
        const $el = $context.find(this.selector);
        if (!$el.length) {
            throw new Error("Couldn't find region's selector in context.");
        }

        // If we currently have a view element,
        // just replace.
        if (this.view.el) {
            $el.replaceWith(this.view.el);
        } else {
            // If we don't have a view element,
            // it means we instantiated the region
            // when the parent view hadn't been rendered.
            this.view.setElement($el);
        }
    },

    // A hook method that is called during
    // a view#remove. Allows a view to be removed,
    // replacing it with the placeholder.
    _removeView(view) {
        if (this.view === view) { this.reset(true); }
    },

    _removeViewLast(view) {
        view.once('remove', this._removeView, this);
    }
});
