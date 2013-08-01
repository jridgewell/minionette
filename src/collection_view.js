Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        // Initialize a object for our modelViews
        this._modelViews = {};
        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelView(options || {});

        Minionette.View.apply(this, arguments);

        // Make sure we remove our modelViews when this is removed.
        this.listenTo(this, 'remove', this._removeModelViews);
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
        this.trigger('render');

        // Dump all our modelViews.
        this._removeModelViews();

        var $el = this.$el.html(this.template(this._serialize()));
        // Use a DocumentFragment to speed up #render()
        this.$el = $(document.createDocumentFragment());

        // Loop through all our models, and build their view.
        this.collection.each(this.addOne, this);

        // Append the DocumentFragment to the rendered template,
        // and set that as this.$el
        this.$el = $el.append(this.$el);

        return this;
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        var view = new this.ModelView({model: model});

        // Add the modelView, and keep track of it.
        this._modelViews[view.cid] = view;
        view._parent = this;

        this.trigger('addOne', view);

        this.$el.append(view.render().$el);
        return view;
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        // This may or may not find a view.
        var view = _.findWhere(this._modelViews, {model: model});

        this.trigger('removeOne', view);
        attempt(view, 'remove');

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
        _.invoke(this._modelViews, 'remove');
    },

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
    _ensureModelView: function(options) {
        this.ModelView = options.ModelView || this.ModelView || Minionette.ModelView;
    }
});
