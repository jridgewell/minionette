Minionette.Router = Backbone.Router.extend({
    constructor: function() {
        Backbone.Router.apply(this, arguments);
        this.on('route', this.routeToControllerAction);
    },

    // Listens to any route events. When one triggers, it tries to split
    // the event name into "{controller}/{action}". It then calls the `action`
    // method on this routers `controller` instance, passing along any route params.
    // Eg. A route matching `posts/:id` to the `posts/show` event will call
    // `this.posts.show(id)`.
    routeToControllerAction: function(event, args) {
        var _this = this;
        event.replace(/^(\w+)\/(\w+)$/, function(_match, controller, action) {
            attempt(_this[controller], action, args);
        });
    }
});
