Minionette.Router = Backbone.Router.extend({
    constructor: function() {
        Backbone.Router.apply(this, arguments);
        this.on('route', this.routeToControllerAction, this);
    },

    routeToControllerAction: function(event, args) {
        var _this = this;
        event.replace(/^(\w+)\/(\w+)$/, function(_match, controller, action) {
            attempt(_this[controller], action, args);
        });
    }
});
