import _ from 'underscore';
import Backbone from 'backbone';
import Region from './region';

export default Backbone.View.extend({
    constructor(options) {
        // Pick out a few initializing options
        _.extend(this, _.pick(options || {}, 'regions', 'template', 'ui'));

        // Initialize our regions object
        this._regions = {};

        Backbone.View.apply(this, arguments);

        // Add the regions
        // This is done _after_ calling Backbone.View's constructor,
        // so that this.$el will be defined when we bind selectors.
        this.addRegions(_.result(this, 'regions'));

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));

        // Always bind this._viewHelper to this.
        // This._viewHelper will be passed into
        // the template as a helper method for
        // rendering regions.
        _.bindAll(this, '_viewHelper');
    },

    Region: Region,

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serialize() { return {}; },

    // The actual "serialize" that is fed into the this.template.
    // Used so a subclass can override this.serialize and still
    // have the `view` helper.
    _serialize() {
        return _.extend({view: this._viewHelper}, this.serialize());
    },

    // A useful remove method that triggers events.
    remove() {
        this.trigger('remove', this);

        // An internal event, **NOT TO BE USED BY DEVS**.
        // Used to ensure removing this view does not cause
        // the region this view is managed by to lose its place.
        this.trigger('remove:internal', this);

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
        let $old = Backbone.$('<div>').append(this.$el.contents());

        let html = _.isFunction(this.template) ?
            this.template(this._serialize()) :
            this.template;
        let $el = Backbone.$('<div>').append(html);

        _.invoke(this._regions, '_setInContext', $el);

        // Clean up any event handlers manually placed
        // on the leftovers.
        $old.empty();

        this.$el.html($el.contents());
        this._addUIElements();

        this.trigger('rendered', this);
        return this;
    },

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions for internal management.
    addRegion(name, view) {
        // Remove the old region, if it exists already
        _.result(this._regions[name], 'remove');

        let options = { name: name };
        // If this is a Backbone.View, pass that as the
        // view to the region.
        if (!view || view.$el) {
            options.view = view;
        } else {
            // If view is a selector, find the DOM element
            // that matches it.
            options.selector = view.selector || view;
            options.el = this.$(view);
        }

        let region = this.buildRegion(options);

        this[name] = region.view;
        this._regions[name] = region;
        region.on('removed', this._removeRegion, this);
        region.on('attach', this._updateRegionView, this);

        return region;
    },

    //TODO
    region(name) {
        return this._regions[name] || this.addRegion(name);
    },

    // An override-able method to construct a new
    // region.
    buildRegion(options) {
        return new this.Region(options);
    },

    // Adds multiple regions to the view. Takes
    // an object with {regioneName: view} syntax
    addRegions(regions) {
        _.each(regions, (view, name) => {
            this.addRegion(name, view);
        });
        return this;
    },

    // A helper to replace an region's old view
    // with a new one.
    _updateRegionView(view, region) {
        this[region.name] = view;
    },

    // A remove helper to remove a region
    _removeRegion(region) {
        region.off('removed', this._removeRegion, this);
        region.off('attach', this._updateRegionView, this);
        this[region.name] = this._regions[region.name] = null;
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
            this['$' + name] = this.$(selector);
        });
    },

    // A helper that is passed to #template that will
    // render regions inline.
    _viewHelper(name) {
        let region = this.region(name);
        return region.placeholder();
    }
});
