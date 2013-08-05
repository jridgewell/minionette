Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        // Initialize a object for our modelViews
        this._modelViews = {};
        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelView(options || {});

        Minionette.View.apply(this, arguments);

        // Augment #render() with our collection specific items.
        this.on('rendered', this._renderCollectionViews);
        // Make sure we remove our modelViews when this is removed.
        this.on('remove', this._removeModelViews);
    },

    // Listen to the default events.
    collectionEvents: {
        add: 'addOne',
        remove: 'removeOne',
        reset: 'render',
        sort: 'render'
    },

    // A default useful render function.
    render: function() {
        // Remove all our modelViews after the 'render' event is
        // fired. This is set on #render() so that the removing
        // will happen after all other 'render' listeners.
        this.once('render', this._removeModelViews());

        return Minionette.CollectionView.__super__.render.apply(this);
    },

    _renderCollectionViews: function() {
        var $el = this.$el;

        // Use a DocumentFragment to speed up #render()
        this.$el = $(document.createDocumentFragment());

        // Loop through all our models, and build their view.
        this.collection.each(this.addOne, this);

        // Append the DocumentFragment to the rendered template,
        // and set that as this.$el
        this.$el = $el.append(this.$el);

    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        var view = new this.ModelView({model: model});

        // Add the modelView, and keep track of it.
        this._modelViews[view.cid] = view;
        view._parent = this;

        this.trigger('addOne', view, this);

        this.$el.append(view.render().$el);

        this.trigger('addedOne', view, this);

        return view;
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        // This may or may not find a view.
        var view = _.findWhere(this._modelViews, {model: model});

        if (view) {
            this.trigger('removeOne', view, this);
            view.remove();
            this.trigger('removedOne', view, this);
        }

        return view;
    },

    // A hook method that is called during
    // a view#remove().
    _removeView: function(view) {
        delete this._modelViews[view.cid];
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
        this.ModelView = options.ModelView || this.ModelView || Minionette.ModelView;
    }
});
