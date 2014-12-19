Minionette.Router
=================

`Minionette.Router` is a base Router class, designed to separate your
app's routes from its controller actions. This prevents Router bloat by
moving the methods that handle each route to the controller.

```javascript
var postsController = {
    index: function() {
        console.log('Posts:', [1, 2, 3]);
    },
    show: function(id) {
        console.log('Post:', id);
    }
};
var usersController = {
    login: function() {
        //...
    }
};

var Router = Minionette.Router.extend({

    // Add any controllers you need
    users: usersController,
    posts: postsController,

    routes: {
        // Standard routes are welcome
        '': 'index'

        // Post's routes
        'posts': 'posts/index',
        'posts/:id': 'posts/show',

        // User's routes
        'users/login': 'users/login'
        'users/posts/:id': 'posts/show'
    },

    index: function() {
        console.log('Hompage');
    }
});
```

## #routeToControllerAction(controller, action, args = [])

`Router`'s `#routeToControllerAction()` is used internally to call the
correct method on the correct controller. It is called whenever a
route's name matches the `{controller}/{method}` pattern, and receives
all parameter parts, splat parts, and the query string as `args`.
Override this method if you need any custom routing logic, eg. parsing
the query string parameters.

```javascript
var router = new (Minionette.Router.extend({
    routes: {
        'posts': 'posts/index'
    },

    routeToControllerAction: function(controller, action, args) {
        var query = parseQuery(_.last(args));
        args[args.length - 1] = query;

        super(controller, action, args);
    }
}));
```
