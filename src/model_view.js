Minionette.ModelView = Minionette.View.extend({

    // Listen to the default events
    modelEvents: {
        'change': 'render',
        'destroy': 'remove'
    },

    // The data that is sent into the template function.
    // Override this to provide custom data.
    serializeData: function() {
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
        return _.clone(this.model.attributes);
    }
});
