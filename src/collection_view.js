Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        // Initialize a storage object for our modelViews
        this._modelViews = {};
        this.modelViewsFrag = null;

        Minionette.View.apply(this, arguments);

        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelViews(options || {});

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

        return Minionette.View.prototype.render.apply(this);
    },

    //TODO
    _renderEmptyView: function() {
        if (!this.EmptyView) { return; }

        var view = this.emptyView = this.buildModelView(
            null,
            this.EmptyView
        );

        this._forwardEvents(view);

        this.appendModelView(view.render());
    },

    //TODO
    _removeEmptyView: function() {
        _.result(this.emptyView, 'remove');
        delete this.emptyView;
    },

    // An override-able method to construct a new
    // documentFragment. Return false to prevent
    // its use, meaning a render will append all the
    // collection's modelViews individually.
    buildDocumentFragment: function() {
        // Use a DocumentFragment to speed up #render()
        return document.createDocumentFragment();
    },

    //TODO
    _renderModelViews: function() {
        if (this.collection.isEmpty()) {
            return this._renderEmptyView();
        }

        this.modelViewsFrag = this.buildDocumentFragment();

        // Loop through all our models, and build their view.
        var modelViews = this.collection.map(this.addOne, this);

        if (this.modelViewsFrag) {
            this.appendModelViewFrag(this.modelViewsFrag);

            _.each(modelViews, function(view) {
                this.trigger('addedOne', view, this);
            }, this);

            this.modelViewsFrag = null;
        }
    },

    // An override-able method to append a modelView to this
    // collectionView's element.
    appendModelView: function(view) {
        this.$el.append(view.$el);
    },

    // An override-able method to append a collection of modelView
    // elements (inside a document fragment) to this collectionView's
    // elements at once.
    appendModelViewToFrag: function(view) {
        this.modelViewsFrag.appendChild(view.el);
    },

    // An override-able method to append a modelView to an efficient
    // DOM element store (a document fragment).
    appendModelViewFrag: function(frag) {
        this.$el.append(frag);
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        this._removeEmptyView();

        var view = this.buildModelView(model, this.ModelView);
        view._parent = this;

        // Setup event forwarding
        this._forwardEvents(view);

        // Add the modelView, and keep track of it.
        this._modelViews[model.cid] = view;

        this.trigger('addOne', view, this);
        view.render();

        if (this.modelViewsFrag) {
            this.appendModelViewToFrag(view);
        } else {
            this.appendModelView(view);
            this.trigger('addedOne', view, this);
        }

        return view;
    },

    // An override-able method to construct a new
    // modelView.
    buildModelView: function(model, ModelView) {
        return new ModelView({model: model});
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        var view = this._modelViews[model.cid];

        if (view) {
            this.trigger('removeOne', view, this);

            view.remove();

            this.trigger('removedOne', view, this);
            this._removeView(view);
        }

        if (!this.emptyView && this.collection.isEmpty()) {
            this._renderEmptyView();
        }

        return view;
    },

    // A hook method that is called during
    // a view#remove().
    _removeView: function(view) {
        delete this._modelViews[_.result(view.model, 'cid')];
        this.stopListening(view);
    },

    // A callback method bound to the 'remove:before'
    // event. Removes all our modelViews.
    _removeModelViews: function() {
        this._removeEmptyView();
        _.invoke(this._modelViews, 'remove');
        this._modelViews = {};
    },

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
    _ensureModelViews: function(options) {
        var mv = options.ModelView || this.ModelView;
        if (!_.isFunction(mv)) {
            mv = Minionette.ModelView.extend(mv);
        }
        this.ModelView = mv;

        var ev = options.EmptyView || this.EmptyView || void 0;
        if (ev && !_.isFunction(ev)) {
            ev = Minionette.ModelView.extend(ev);
        }
        this.EmptyView = ev;
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
