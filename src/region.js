import _ from 'underscore';
import Backbone from 'backbone'
import PlaceholderView from './placeholder_view';

export default function Region(options = {}) {
    // Setup a unique id for this region.
    // Not really necessary, but it doesn't hurt.
    this.cid = _.uniqueId('r');
    this.name = options.name;

    // Make sure we have a view.
    this._setView(options);
};

// Allow Regions to be extended.
// Backbone's extend is generic, just copy it over.
Region.extend = Backbone.View.extend;

function attributeReducer(attributes, left, right) {
    return _.map(attributes, (attr) => {
        const value = attr.value ? `="${attr.value}"` : '';
        return `${left}${attr.name}${value}${right}`;
    }).join('');
}

function throwPlaceholder() {
    throw new Error('Cannot use view template helper with region declared using a selector');
}

_.extend(Region.prototype, Backbone.Events, {
    PlaceholderView: PlaceholderView,

    // The inverse of #placeholder, meant to identify it.
    // This is overridden if the region is instantiated with
    // a selector.
    selector() {
        const el = this.view.el;

        // Special case id, for faster lookups.
        if (el.id) { return `#${el.id}`; }

        const selector = el.tagName;
        let attributes = el.attributes;
        // Special case class, for faster lookups.
        if (el.className) {
            const className = el.className.replace(/ /g, '.');
            selector = `${selector}.${className}`;
            attributes = _.reject(attributes, { name: 'class' });
        }

        return selector + attributeReducer(attributes, '[', ']');
    },

    // Transforms the current view's el into a placeholder element for
    // use with the view template helper.
    placeholder() {
        const el = this.view.el;

        // Special case childless nodes. This also handles
        // self closing tags, like <br />
        if (!el.childNodes.length) { return el.outerHTML; }

        const tagName = el.tagName;
        const attributes = attributeReducer(el.attributes, ' ', '');
        return `<${tagName}${attributes}></${tagName}>`;
    },

    // An override-able method to construct a new
    // placeholder view.
    buildPlaceholderView(options) {
        return new this.PlaceholderView(options);
    },

    // Ensures the region has a view.
    _setView(options) {
        const view = options.view || this.buildPlaceholderView(options);
        this.attach(view);

        if (options.selector) {
            this.selector = options.selector;
            this.placeholder = throwPlaceholder;
        } else {
            this._resetDOMMethods();
        }
    },

    // Ensures that the view's el is contained inside the parent view's.
    _setInContext($context) {
        const $el = $context.find(_.result(this, 'selector'));
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
    reset(detach) {
        this.attach(this.buildPlaceholderView({}), detach);
        this._resetDOMMethods();
        return this;
    },

    _resetDOMMethods() {
        _.extend(this, _.pick(Region.prototype, 'selector', 'placeholder'));
    },

    // A proxy method to the view's render().
    render() {
        return this.view.render();
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
        if (oldView && !newView.$el.is($current)) {
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

    // Removes this region, and it's view.
    remove() {
        this.trigger('remove', this);

        this.view.remove();
        this.stopListening();

        this.trigger('removed', this);
        return this;
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
