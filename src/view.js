Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        options = options || {};

        // Ensure we have a Region to initialize
        // new regions from.
        this._ensureRegion(options);
        this._initializeRegions(options);

        Backbone.View.apply(this, arguments);

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));

        // Always bind this._viewHelper to this.
        // This._viewHelper will be passed into
        // the template as a helper method for
        // rendering regions.
        _.bindAll(this, '_viewHelper');
    },

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template: function() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serialize: function() {
        return {};
    },

    // The actual "serialize" that is fed into the this.template.
    // Used so a subclass can override this.serialize and still
    // have the `view` helper.
    _serialize: function() {
        return _.extend({view: this._viewHelper}, this.serialize());
    },

    // A useful remove method that triggers events.
    remove: function() {
        if (this._isRemoving) { return; }
        this._isRemoving = true;
        this.trigger('remove', this);

        this._removeFromParent();
        _.invoke(this._regions, 'remove');

        Minionette.View.__super__.remove.apply(this, arguments);

        this.trigger('removed', this);
        this.unbind();
    },

    // A useful default render method.
    render: function() {
        this.trigger('render', this);

        // Detach all our regions, so they don't need to be re-rendered.
        _.invoke(this._regions, 'detach');

        this.$el.html(this.template(this._serialize()));

        // Reattach all our regions
        _.invoke(this._regions, 'reattach');

        this.trigger('rendered', this);
        return this;
    },

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions[name], for
    // internal management.
    addRegion: function(name, view) {
        // Remove the old region, if it exists already
        attempt(this._regions[name], 'remove');

        var options = { name: name };
        // If this is a Backbone.View, pass that as the
        // view to the region.
        if (!view || view.$el) {
            options.view = view;
        } else {
            // If view is a selector, find the DOM element
            // that matches it.
            options.el = this.$(view);
            options.el.selector = view.selector || view;
        }

        var region = new this.Region(options);

        region._parent = this;
        this[name] = this._regions[name] = region;

        return region;
    },

    // Adds multiple regions to the view. Takes
    // an object with {regioneName: view} syntax
    addRegions: function(regions) {
        _.each(regions, function(view, name) {
            this.addRegion(name, view);
        }, this);
    },

    // A remove helper to remove this view from it's parent
    _removeFromParent: function() {
        // Remove this view from _parent, if it exists
        attempt(this._parent, '_removeView', this);
    },

    _removeRegion: function(region) {
        delete this[region.cid];
        delete this._regions[region.cid];
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

    // Sets this.Region. Prioritizes instantiated options.Region,
    // then a subclass' prototype Region, and defaults to Minionette.Region
    _ensureRegion: function(options) {
        this.Region = options.Region || this.Region || Minionette.Region;
    },

    // Takes the #regions object and creates the regions,
    // using the keys as the name and the values as the original
    // view. Keys are all that is required, passing in a false-y
    // value will make Region use a placeholder span element.
    _initializeRegions: function(options) {
        // Initialize our regions object
        this._regions = {};

        // Pull regions from instantiated options.
        var regions = _.result(options, 'regions') || _.result(this, 'regions');

        // Add the regions
        this.addRegions(regions);
    },

    // A helper that is passed to #template() that will
    // render regions inline.
    _viewHelper: function(view) {
        var region = this._regions[view];
        if (region && region.render().el) {
            return region.view.el.outerHTML;
        }
        return '';
    }
});
