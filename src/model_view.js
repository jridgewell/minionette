Minionette.ModelView = Minionette.View.extend({
    // Listen to the default events
    modelEvents: {
        'change': 'render',
        'destroy': 'remove'
    },

    // The data that is sent into the template function.
    // Override this to provide custom data.
    serializeData: function() {
        var superRet = Minionette.ModelView.__super__.serializeData.apply(this, arguments);
        return _.extend(superRet, this.model.attributes);
    }
});
