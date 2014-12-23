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
        // Use a span so it collapses on the DOM.
        tagName: 'span',
        // Use the data-cid attribute as a unique
        // attribute. Used for reattaching a detached view.
        attributes: function() {
            return { 'data-cid': this.cid };
        }
    }),

    // The inverse of #placeholder, meant to identify it.
    // This is overridden if the region is instantiated with
    // a selector.
    selector: function() {
        var el = this.view.el;
        var selector = el.tagName;

        // Special case id and class, for faster lookups.
        if (el.id) { return '#' + el.id; }
        if (el.className) { selector += '.' + el.className.replace(/ /g, '.'); }

        selector += _.chain(el.attributes).reject(function(attr) {
            return attr.name === 'class';
        }).map(function(attr) {
            var value = attr.value ? '="' + attr.value + '"' : '';
            return '[' + attr.name + value + ']';
        }).value();
        return selector;
    },

    // Transforms the current view's el into a placeholder element for
    // use with the view template helper.
    placeholder: function() {
        var el = this.view.el;
        if (!el) { return ''; }

        // Special case childless nodes. This also handles
        // self closing tags, like <br />
        if (!el.childNodes) { return el.outerHTML; }

        var tagName = el.tagName;
        var attributes = _.reduce(el.attributes, function(attributes, attr) {
            var value = attr.value ? '="' + attr.value + '"' : '';
            return attributes + ' ' + attr.name + value;
        }, '');
        return '<' + tagName + attributes + '></' + tagName + '>';
    },

    // An override-able method to construct a new
    // placeholder view.
    buildPlaceholderView: function(options) {
        return new this.PlaceholderView(options);
    },

    // Ensures the region has a view.
    _setView: function(options) {
        this.view = options.view || this.buildPlaceholderView(options);
        // And set our views' _parent to this region.
        this.view._parent = this;

        _.extend(this, _.pick(options, 'selector'));
    },

    // Ensures that the view's el is contained inside the parent view's.
    _setInContext: function($context) {
        var $el = $context.find(_.result(this, 'selector'));
        if (!$el.length) {
            throw new Error("couldn't find region's selector in context");
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

    // Resets the region's view to placeholder view.
    // Optionally takes a boolean, in which case the
    // oldView will just be detached.
    reset: function(detach) {
        this.attach(this.buildPlaceholderView(), detach);
        return this;
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

        // Prevent an extra reflow from resetting
        var view = this.view;
        delete this.view;
        view.remove();

        this._removeFromParent();
        this.stopListening();

        this.trigger('removed', this);
        return this;
    },

    // A remove helper to remove this region from it's parent
    // view.
    _removeFromParent: function() {
        // Remove this region from its parent, if it exists
        attempt(this._parent, '_removeRegion', this);
    },

    // A hook method that is called during
    // a view#remove. Allows a view to be removed,
    // replacing it with the placeholder.
    _removeView: function(view) {
        if (this.view === view) {
            this.reset(true);
        }
    }
});
