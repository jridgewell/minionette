import Backbone from 'backbone';
import attempt from './attempt';

const routeMatcher = /^(\w+)\/(\w+)$/;

export default Backbone.Router.extend({
    constructor() {
        Backbone.Router.apply(this, arguments);
        this.on('route', this._parseRouteEvent);
    },

    // Listens to any route events. When one triggers, it tries to split
    // the event name into "{controller}/{action}".
    _parseRouteEvent(event, args) {
        event.replace(routeMatcher, (_match, controller, action) => {
            this.routeToControllerAction(controller, action, args);
        });
    },

    // Calls the `action` method on this routers `controller` instance,
    // passing along any route params.
    // Eg. A route matching `posts/:id` to the `posts/show` event will call
    // `this.posts.show(id)`.
    routeToControllerAction(controller, action, args) {
        attempt(this[controller], action, args);
    }
});
