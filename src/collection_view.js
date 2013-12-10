Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        // Initialize a storage object for our modelViews
        this._modelViews = {};

        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelView(options || {});

        Minionette.View.apply(this, arguments);

        // Augment #render() with our collection specific items.
        this.on('rendered', this._renderModelViews);
        // Make sure we remove our modelViews when this is removed.
        this.on('removed', this._removeModelViews);
    },

    // Listen to the default events.
    collectionEvents: {
        add: 'addOne',
        remove: 'removeOne',
        reset: 'render',
        sort: 'render'
    },

    // The prefix that will be put on every event triggered
    // by one of the modelViews. So, if a modelView triggers
    // "event", collectionView will trigger "modelView:event"
    // ("event" -> "modelView:event").
    // A falsey value will cause no prefix (or colon) to be
    // used ("event" -> "event").
    modelViewEventPrefix: 'modelView',

    ModelView: Minionette.ModelView,

    // A default useful render function.
    render: function() {
        // Remove all our modelViews after the 'render' event is
        // fired. This is set on #render() so that the removing
        // will happen after all other 'render' listeners.
        this.once('render', this._removeModelViews);

        return Minionette.CollectionView.__super__.render.apply(this);
    },

    _renderModelViews: function() {
        // Use a DocumentFragment to speed up #render()
        var frag = $(document.createDocumentFragment());

        // Override `appendHtml()` for the time being.
        // This is so we can append directly to the DocumentFragment,
        // and then append it all at once later.
        var appendHtml = this.appendHtml;
        this.appendHtml = function(element) { frag.append(element); };

        // Loop through all our models, and build their view.
        this.collection.each(this.addOne, this);

        // Append the DocumentFragment to the rendered template,
        // and set `appendHtml()` back to normal.
        this.appendHtml = appendHtml;
        this.appendHtml(frag);
    },

    appendHtml: function($element) {
        this.$el.append($element);
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        var view = this.buildModelView(model);

        // Setup event forwarding
        this._forwardEvents(view);

        // Add the modelView, and keep track of it.
        this._modelViews[model.cid] = view;
        view._parent = this;

        this.trigger('addOne', view, this);

        this.appendHtml(view.render().$el);

        this.trigger('addedOne', view, this);

        return view;
    },

    // An override-able method to construct a new
    // modelView.
    buildModelView: function(model) {
        return new this.ModelView({model: model});
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        var view = this._modelViews[model.cid];

        if (view) {
            this.trigger('removeOne', view, this);
            view.remove();
            this.trigger('removedOne', view, this);
            this.stopListening(view);
        }

        return view;
    },

    // A hook method that is called during
    // a view#remove().
    _removeView: function(view) {
        delete this._modelViews[view.model.cid];
    },

    // A callback method bound to the 'remove:before'
    // event. Removes all our modelViews.
    _removeModelViews: function() {
        // Empty the entire $el, that way each individual
        // modelView removal won't trigger a DOM reflow.
        this.$el.empty();
        _.invoke(this._modelViews, 'remove');
    },

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
    _ensureModelView: function(options) {
        var mv = options.ModelView || this.ModelView || {};
        if (!_.isFunction(mv)) {
            mv = Minionette.ModelView.extend(mv);
        }
        this.ModelView = mv;
    },

    // Since CollectionView is meant to be largely automated,
    // setup event forwarding from modelViews. That way,
    // you only need to listen to events that happen on
    // this collectionView, not on all the modelViews.
    _forwardEvents: function(view) {
        this.listenTo(view, 'all', function() {
            var args = _.toArray(arguments);
            var prefix = _.result(this, 'modelViewEventPrefix');
            prefix = (prefix) ? prefix + ':' : '';

            args[0] = prefix + args[0];
            args.push(view);

            this.trigger.apply(this, args);
        });
    }
});
