import _ from 'underscore';
import Backbone from 'backbone';
import Region from './region';

export default Backbone.View.extend({
    constructor(options = {}) {
        // Pick out a few initializing options
        _.extend(this, _.pick(options, 'regions', 'template', 'ui'));

        // Initialize our regions object
        this._regions = {};

        Backbone.View.apply(this, arguments);

        // Add the regions
        // This is done _after_ calling Backbone.View's constructor,
        // so that this.$el will be defined when we bind selectors.
        this._addRegions(_.result(this, 'regions'));

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));
    },

    Region: Region,

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serialize() { return {}; },

    // A useful remove method that triggers events.
    remove() {
        this.trigger('remove', this);

        _.invoke(this._regions, 'remove');
        Backbone.View.prototype.remove.apply(this, arguments);

        this.trigger('removed', this);
        return this;
    },

    // A useful default render method.
    render() {
        this.trigger('render', this);

        // Get a reference to everything currently in
        // $el while also detaching them from the DOM.
        const $old = Backbone.$('<div>').append(this.$el.contents());

        const html = _.isFunction(this.template) ?
            this.template(this.serialize()) :
            this.template;
        const $el = Backbone.$('<div>').append(html);

        _.invoke(this._regions, '_setInContext', $el);

        // Clean up any event handlers manually placed
        // on the leftovers.
        $old.empty();

        this._updateDOMAttributes();
        this.$el.html($el.contents());
        this._addUIElements();

        this.trigger('rendered', this);
        return this;
    },

    setElement(element) {
        Backbone.View.prototype.setElement.apply(this, arguments);
        _.invoke(this._regions, '_setInContext', this.$el);
        this._addUIElements();
    },

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions for internal management.
    addRegion(name, selector) {
        if (selector instanceof Backbone.$) {
            throw new Error('jQuery objects are not supported, please pass a selector string.');
        }
        const options = {
            name: name
            selector: selector
            el: this.$(selector);
        };
        const region = this.buildRegion(options);

        this[name] = region.view;
        this._regions[name] = region;
        region.on('attach', this._updateRegionView, this);

        return region;
    },

    region(name) {
        return this._regions[name];
    },

    // An override-able method to construct a new
    // region.
    buildRegion(options) {
        return new this.Region(options);
    },

    // Adds multiple regions to the view. Takes
    // an object with {regioneName: view} syntax
    _addRegions(regions) {
        _.each(regions, (selector, name) => {
            this._addRegion(name, selector);
        });
        return this;
    },

    // A helper to replace an region's old view
    // with a new one.
    _updateRegionView(view, region) {
        this[region.name] = view;
    },

    // Loop through the events given, and listen to
    // entity's event.
    _listenToEvents(entity, events) {
        if (!entity) { return; }
        _.each(events, (method, event) => {
            if (!_.isFunction(method)) { method = this[method]; }
            this.listenTo(entity, event, method);
        });
    },

    // Loops through all UI elements, attaching them
    // for easy access
    _addUIElements() {
        _.each(_.result(this, 'ui'), (selector, name) => {
            this[`$${name}`] = this.$(selector);
        });
    },

    _updateDOMAttributes() {
        const attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        this._setAttributes(attrs);
    }
});
