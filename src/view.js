Minionette.View = Backbone.View.extend({
    constructor: function() {
        Backbone.View.apply(this, arguments);

        // Done so we don't bindAll to standard methods.
        _.bindAll(this, '_jqueryRemove', '_close');

        // Keep track of our subviews.
        this._subViews = {};

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, this.modelEvents);
        this._listenToEvents(this.collection, this.collectionEvents);
        this.listenTo(this, 'close:before', this._close);
    },

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template: function() { return ''; },

    // When delegating events, bind this view to jQuery's special remove event.
    // Allows us to clean up the view, even if you remove this.$el with jQuery.
    // http://blog.alexmaccaw.com/jswebapps-memory-management
    delegateEvents: function() {
        Backbone.View.prototype.delegateEvents.apply(this, arguments);
        this.$el.on('remove.delegateEvents' + this.cid, this._jqueryRemove);
    },

    // A useful remove method to that triggers events.
    // Notice we emit "close" events, not "remove".
    close: function() {
        this.trigger('close:before');
        this.remove();
        this.trigger('close');
    },

    // A called on close:before to remove all our subviews.
    _close: function() {
        _.each(this._subViews, function(view) { view.close(); });
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
    assign : function (selector, view, replace) {
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
            this._subViews[view.cid] = view;
            if (replace) {
                this.$(selector).replaceWith(view.el);
            } else {
                view.setElement(this.$(selector)).render();
            }
        }, this);
    },

    // A proxy method to this.close().
    // This is bindAll-ed to the view instance.
    // Done so that we don't need to bindAll to close().
    _jqueryRemove: function() {
        this.close();
    },

    // Loop through the events given, and listen to
    // entity's event.
    _listenToEvents: function(entity, events) {
        for (var event in events) {
            var method = events[event];
            if (!_.isFunction(method)) { method = this[method]; }
            if (!method) { continue; }

            this.listenTo(entity, event, method);
        }
        return this;
    }
});
