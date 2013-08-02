Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        options || (options = {});

        // Ensure we have a Region to initialize
        // new regions from.
        this._ensureRegion(options);
        this._initializeRegions(options);

        Backbone.View.apply(this, arguments);

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));
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
        return _.extend({view: _.bind(this._viewHelper, this)}, this.serialize());
    },

    // A useful remove method that triggers events.
    remove: function() {
        if (!this._isRemoving) {
            this._isRemoving = true;
            this.trigger('remove');

            this._removeFromParent();
            _.invoke(this._regions, 'remove');

            Minionette.View.__super__.remove.apply(this, arguments);

            this.unbind();
        }
    },

    // A useful default render method.
    render: function() {
        this.trigger('render');

        // Detach all our regions, so they don't need to be re-rendered.
        _.invoke(this._regions, 'detach');

        this.$el.html(this.template(this._serialize()));

        // Reattach all our regions
        _.invoke(this._regions, 'reattach');

        return this;
    },

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions[name], for
    // internal management.
    addRegion: function(name, view) {
        var region = new this.Region({view: view});
        // Remove the region, if it exists already
        attempt(this._regions[name], 'remove');

        region.name = name;
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
        this._parent = null;
    },

    _removeRegion: function(region) {
        if (this._regions[region.name]) {
            delete this[region.name];
            delete this._regions[region.name];
        }
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
        var regions = _.result(this, 'regions');
        if (options.regions) { regions = options.regions; }

        // Add the regions
        this.addRegions(regions);
    },

    // A helper that is passed to #template() that will
    // render regions inline.
    _viewHelper: function(view) {
        var region = this._regions[view];
        if (region) {
            return region.render().el.outerHTML;
        }
        return '';
    }
});
