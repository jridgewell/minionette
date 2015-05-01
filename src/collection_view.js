Minionette.CollectionView = Minionette.View.extend({
    constructor: function() {
        // Initialize a storage object for our modelViews
        this._modelViews = {};
        this.modelViewsFrag = null;

        Minionette.View.apply(this, arguments);

        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelViews();

        // Augment #render with our collection specific items.
        this.on('rendered', this._renderModelViews);
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

    // The same as `modelViewEventPrefix`, except used exclusively
    // for forwarding events from the emptyView.
    emptyViewEventPrefix: 'emptyView',

    ModelView: Minionette.ModelView,

    // Augment View#render so we can remove our old modelViews.
    render: function() {
        // Remove all our modelViews after the 'render' event is
        // fired. This is set on #render so that the removing
        // will happen after all other 'render' listeners.
        this.once('render', this._removeModelViews);

        return Minionette.View.prototype.render.apply(this, arguments);
    },

    // Augment View#remove so we can remove our modelViews.
    remove: function() {
        // Remove all our modelViews after the 'remove' event is
        // fired. This is set on #remove so that the removing
        // will happen after all other 'remove' listeners.
        this.once('remove', this._removeModelViews);

        return Minionette.View.prototype.remove.apply(this, arguments);
    },

    // Render all the collection's models as modelViews,
    // using a DocumentFragment to add all modelViews
    // efficiently.
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

    // Add the empty view to this.$el, if the
    // EmptyView constructor is present.
    _renderEmptyView: function() {
        if (!this.EmptyView || this.emptyView || !this.collection.isEmpty()) {
            return;
        }

        var view = this.emptyView = this.buildEmptyView();
        this._forwardEvents(view, 'emptyViewEventPrefix');
        this.appendModelView(view.render());
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

        var view = this.buildModelView(model);

        // Setup event forwarding
        this._forwardEvents(view, 'modelViewEventPrefix');

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
    buildModelView: function(model) {
        return new this.ModelView({ model: model });
    },

    // An override-able method to construct a new
    // documentFragment. Return false to prevent
    // its use, meaning a render will append all the
    // collection's modelViews individually.
    buildDocumentFragment: function() {
        // Use a DocumentFragment to speed up #render
        return document.createDocumentFragment();
    },

    // An override-able method to construct a new
    // emptyView.
    buildEmptyView: function() {
        return new this.EmptyView();
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        var view = this._modelViews[model.cid];

        if (view) {
            this.trigger('removeOne', view, this);

            view.remove();

            this.trigger('removedOne', view, this);
        }

        return view;
    },

    // A hook method that is called during
    // a view#remove.
    _removeView: function(view) {
        delete this._modelViews[_.result(view.model, 'cid')];
        this._removeReference(view);

    // Removes event listeners from the view to this collectionView.
    _removeReference: function(view) {
        view.off('all', this._forwardEvents, this);
        view.off('removed', this._removeView, this);
    },

    // A callback method bound to the 'remove:before'
    // event. Removes all our modelViews.
    _removeModelViews: function() {
        this._removeEmptyView();
        _.invoke(this._modelViews, 'remove');
        this._modelViews = {};
    },

    // Removes the emptyView, if it exists.
    _removeEmptyView: function() {
        if (this.emptyView) {
            this.emptyView.remove();
            this.stopListening(this.emptyView);
            this.emptyView = null;
        }
    },

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
    _ensureModelViews: function() {
        var mv = this.ModelView;
        if (!_.isFunction(mv)) {
            mv = Minionette.ModelView.extend(mv);
        }
        this.ModelView = mv;

        var ev = this.EmptyView;
        if (ev && !_.isFunction(ev)) {
            ev = Minionette.View.extend(ev);
        }
        this.EmptyView = ev;
    },

    // Since CollectionView is meant to be largely automated,
    // setup event forwarding from modelViews. That way,
    // you only need to listen to events that happen on
    // this collectionView, not on all the modelViews.
    _forwardEvents: function(view, prefixer) {
        var forwardEvents = rest(function(args) {
            var prefix = _.result(this, prefixer);
            if (prefix) {
                args[0] = prefix + ':' + args[0];
            }

            args.push(view);
            this.trigger.apply(this, args);
        });
        forwardEvents._callback = this._forwardEvents;
        view.on('all', forwardEvents, this);
        view.on('removed', this._removeView, this);
    }
});
