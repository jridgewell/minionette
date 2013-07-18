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
