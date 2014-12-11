import Backbone from 'backbone';
import attempt from 'attempt';

class Router extends Backbone.Router {
    constructor(options) {
        super(options);
        this.on('route', this.routeToControllerAction, this);
    }

    routeToControllerAction(event, args) {
        var _this = this;
        event.replace(/^(\w+)\/(\w+)$/, function(_match, controller, action) {
            attempt(_this[controller], action, args);
        });
    }
}

Router.extend = Backbone.Router.extend;

export default Router;
