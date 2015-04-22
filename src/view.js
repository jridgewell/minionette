Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        // Pick out a few initializing options
        _.extend(this, _.pick(options || {}, 'regions', 'Region', 'template', 'ui'));

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
        Backbone.View.prototype.remove.apply(this, arguments);

        this.trigger('removed', this);
        return this;
    },

    // A useful default render method.
    render: function() {
        this.trigger('render', this);

        // Get a reference to everything currently in
        // $el while also detaching them from the DOM.
        var $old = Backbone.$('<div>').append(this.$el.contents());

        var html = _.isFunction(this.template) ?
            this.template(this._serialize()) :
            this.template;
        var $el = Backbone.$('<div>').append(html);

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
    addRegion: function(name, view) {
        // Remove the old region, if it exists already
        _.result(this._regions[name], 'remove');

        var options = this.buildRegionOptions(name, view);
        var region = this.buildRegion(options);

        region._parent = this;
        this[name] = region.view;
        this._regions[name] = region;

        return region;
    },

    //TODO
    region: function(name) {
        return this._regions[name] || this.addRegion(name);
    },

    // An override-able method to construct a new
    // region.
    buildRegion: function(options) {
        return new this.Region(options);
    },

    // TODO
    buildRegionOptions: function(name, view) {
        var options = { name: name };
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
        return options;
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

    // A helper to replace an region's old view
    // with a new one.
    _updateRegionView: function(region) {
        this[region.name] = region.view;
    },

    // A remove helper to remove a region
    _removeRegion: function(region) {
        delete this[region.name];
        delete this._regions[region.name];
    },

    // Loop through the events given, and listen to
    // entity's event.
    _listenToEvents: function(entity, events) {
        if (!entity) { return; }
        _.each(events, function(method, event) {
            if (!_.isFunction(method)) { method = this[method]; }
            this.listenTo(entity, event, method);
        }, this);
    },

    // Loops through all UI elements, attaching them
    // for easy access
    _addUIElements: function() {
        _.each(_.result(this, 'ui'), function(selector, name) {
            this['$' + name] = this.$(selector);
        }, this);
    },

    // A helper that is passed to #template that will
    // render regions inline.
    _viewHelper: function(name) {
        var region = this.region(name);
        return region.placeholder();
    }
});
