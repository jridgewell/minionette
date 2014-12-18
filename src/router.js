var routeMatcher = /^(\w+)\/(\w+)$/;

Minionette.Router = Backbone.Router.extend({
    constructor: function() {
        Backbone.Router.apply(this, arguments);
        this.on('route', this._parseRouteEvent);
    },

    // Listens to any route events. When one triggers, it tries to split
    // the event name into "{controller}/{action}".
    _parseRouteEvent: function(event, args) {
        var _this = this;
        event.replace(routeMatcher, function(_match, controller, action) {
            _this.routeToControllerAction(controller, action, args);
        });
    },

    // Calls the `action` method on this routers `controller` instance,
    // passing along any route params.
    // Eg. A route matching `posts/:id` to the `posts/show` event will call
    // `this.posts.show(id)`.
    routeToControllerAction: function(controller, action, args) {
        attempt(this[controller], action, args);
    }
});
