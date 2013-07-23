Minionette.View = Backbone.View.extend({
    constructor: function() {
        Backbone.View.apply(this, arguments);

        // Keep track of our subviews.
        this._subViews = {};

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, this.modelEvents);
        this._listenToEvents(this.collection, this.collectionEvents);
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
    serializeData: function() { return {}; },

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

    // Assign a subview to an element in my template.
    // `selector` is a dom selector to assign to.
    // `view` is the subview to assign the selector to.
    // `replace` is a boolean.
    //    `False` (default), set view's $el to the selector.
    //    `True`, replace the selector with view's $el.
    // Alternate syntax by passing in an object for selector.
    //    With "selector": subview
    //    Replace will be the second param in this case.
    assign: function (selector, view, replace) {
        var selectors;
        if (_.isObject(selector)) {
            selectors = selector;
            replace = view;
        } else {
            selectors = {};
            selectors[selector] = view;
        }
        if (!selectors) { return; }

        _.each(selectors, function (view, selector) {
            this._addSubView(view);
            if (replace) {
                this.$(selector).replaceWith(view.el);
            } else {
                view.setElement(this.$(selector)).render();
            }
        }, this);
    },

    // A remove helper to remove this view from it's parent
    _removeFromParentView: function() {
        if (this._parentView && this._parentView._removeSubView) {
            this._parentView._removeSubView(this);
        }
    },

    _addSubView: function(view) {
        this._subViews[view.cid] = view;
        view._parentView = this;
    },

    _removeSubView: function(subView) {
        delete this._subViews[subView.cid];
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
        for (var event in events) {
            var method = events[event];
            if (!_.isFunction(method)) { method = this[method]; }
            if (!method) { continue; }

            this.listenTo(entity, event, method);
        }
        return this;
    }
});
