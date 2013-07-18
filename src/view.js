Minionette.View = Backbone.View.extend({
    constructor: function() {
        Backbone.View.apply(this, arguments);

        _.bindAll(this, '_jquery_remove');

        this._subViews = {};
        this._bindEntityEvents(this, this.model, this.modelEvents);
        this._bindEntityEvents(this, this.collection, this.collectionEvents);
    },

    template: function() { return ''; },

    delegateEvents: function(events) {
        Backbone.View.prototype.delegateEvents.apply(this, events);
        this.$el.on('remove.delegateEvents' + this.cid, this._jquery_remove);
    },

    close: function() {
        _.each(this._subViews, function(view) { view.close(); });
        this.remove();
    },


    // Attach a subview to an element in my template
    // selector is a dom selector to assign to
    // view is the subview to assign the selector to
    // replace is a boolean
    //    False (default), set view's $el to the selector
    //    True, replace the selector with view's $el
    // Alternate syntax by passing in an object for selector
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

    _jquery_remove: function() {
        this.close();
    },

    _bindEntityEvents: function(target, entity, events) {
        for (var event in events) {
            var method = events[event];
            if (!_.isFunction(method)) { method = this[method]; }
            if (!method) { continue; }

            target.listenTo(entity, event, method);
        }
        return this;
    }
});
