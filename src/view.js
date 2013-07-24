Minionette.View = Backbone.View.extend({
    constructor: function(options) {
        this._initializeSubViews(options || {});

        Backbone.View.apply(this, arguments);

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));
    },

    // The Parent View of this View
    // Defaults to nothing
    _parentView: null,

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template: function() { return ''; },

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serializeData: function() {
        //TODO: FIX THIS
        return {};
        // return _.pick(this, _.keys(this.subViews || {}));
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

        this._removeFromParentView();
        this._removeSubViews();

        Backbone.View.prototype.remove.apply(this, arguments);

        this.trigger('remove');
    },

    // A useful default render method.
    render: function() {
        this.trigger('render:before');

        // Detach all our subviews, so they don't need to be re-rendered.
        _.each(this._subViews, function(view) { view.$el.detach(); });

        this.$el.html(this.template(this.serializeData()));

        // Listen for render events to reattach subviews.
        this.trigger('render');
        return this;
    },

    // A remove helper to remove this view from it's parent
    _removeFromParentView: function() {
        if (this._parentView && this._parentView._removeSubView) {
            this._parentView._removeSubView(this);
        }
    },

    // A remove helper to clear our subviews.
    _removeSubViews: function() {
        _.invoke(this._subViews, 'remove');
    },

    // Does the same thing as this.remove(), without
    // actually removing the element. Done to prevent
    // us from removing an element that is already removed.
    _jqueryRemove: function() {
        this.trigger('remove:jquery');
        this._removeFromParentView();
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
    _initializeSubViews: function(options) {
        var subViews = {};
        // Pull subViews from instantiated options.
        if (options.subViews) { subViews = options.subViews; }

        _.each(subViews, function(view, name) {
            this.addRegion(name, view);
        }, this);
    },

    addRegion: function(name, view) {
        this._addSubView(view);
        this._addRegion(name);
        return this[name] = new Minionette.Region({view: view});
    },

    _addRegion: function(name) {
        this._regions || (this.regions = []);
        this.regions.push(name);
    },

    _addSubView: function(view) {
        this.subViews || (this.subViews = {});
        this._subViews[view.cid] = view;
        view._parentView = this;
    },

    _removeSubView: function(subView) {
        delete this._subViews[subView.cid];
    }

});
