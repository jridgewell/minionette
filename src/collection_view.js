Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        // Initialize a storage object for our modelViews
        this._modelViews = {};
        this._modelViewModels = {};

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
        this.once('render', this._removeModelViews);

        return Minionette.CollectionView.__super__.render.apply(this);
    },

    _renderCollectionViews: function() {
        // Use a DocumentFragment to speed up #render()
        var frag = document.createDocumentFragment();

        // Override `appendHtml()` for the time being.
        // This is so we can append directly to the DocumentFragment,
        // and then append it all at once later.
        var appendHtml = this.appendHtml;
        this.appendHtml = function(element) { frag.appendChild(element[0]); };

        // Loop through all our models, and build their view.
        this.collection.each(this.addOne, this);

        // Append the DocumentFragment to the rendered template,
        // and set `appendHtml()` back to normal.
        this.appendHtml = appendHtml;
        this.appendHtml(frag);
    },

    appendHtml: function(element) {
        this.$el.append(element);
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        var view = new this.ModelView({model: model});

        // Add the modelView, and keep track of it.
        this._modelViews[view.cid] = view;
        this._modelViewModels[model.cid] = view;
        view._parent = this;

        this.trigger('addOne', view, this);

        this.appendHtml(view.render().$el);

        this.trigger('addedOne', view, this);

        return view;
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        var view = this._modelViewModels[model.cid];

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
        delete this._modelViewModels[view.model.cid];
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
