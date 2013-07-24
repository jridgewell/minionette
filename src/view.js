Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        this._initializeRegions(options || {});

        Backbone.View.apply(this, arguments);

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));
    },

    // The Parent View of this View
    // Defaults to nothing
    _parent: null,

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template: function() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serializeData: function() {
        //TODO: FIX THIS
        return {};
    },

    // When delegating events, bind this view to jQuery's special remove event.
    // Allows us to clean up the view, even if you remove this.$el with jQuery.
    // http://blog.alexmaccaw.com/jswebapps-memory-management
    delegateEvents: function() {
        Backbone.View.prototype.delegateEvents.apply(this, arguments);

        _.bindAll(this, '_jqueryRemove');
        this.$el.on('remove.delegateEvents' + this.cid, this._jqueryRemove);
    },

    // A useful remove method to that triggers events.
    remove: function() {
        this.trigger('remove:before');

        this._removeFromParent();
        _.invoke(this._regions, 'remove');

        Backbone.View.prototype.remove.apply(this, arguments);

        this.trigger('remove');
    },

    // A useful default render method.
    render: function() {
        this.trigger('render:before');

        // Detach all our regions, so they don't need to be re-rendered.
        _.invoke(this._regions, 'detach');

        this.$el.html(this.template(this.serializeData()));

        // Reattach all our regions
        _.invoke(this._regions, 'reattach');

        this.trigger('render');
        return this;
    },

    // A remove helper to remove this view from it's parent
    _removeFromParent: function() {
        if (this._parent && this._parent._removeView) {
            this._parent._removeView(this);
            this._parent = null;
        }
    },

    // Does the same thing as this.remove(), without
    // actually removing the element. Done to prevent
    // us from removing an element that is already removed.
    _jqueryRemove: function() {
        this.trigger('remove:jquery');
        this._removeFromParent();
        this.stopListening();
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

    // TODO: comments
    _initializeRegions: function(options) {
        // Initialize our regions object
        this._regions = {};

        // Pull regions from instantiated options.
        var regions = this.regions;
        if (options.regions) { regions = options.regions; }

        // Add the regions
        _.each(regions, function(view, name) {
            this.addRegion(name, view);
        }, this);
    },

    addRegion: function(name, view) {
        this[name] = this._regions[name] = new Minionette.Region({view: view});
        return this[name];
    }
});
