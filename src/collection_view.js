Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        // Initialize a object for our modelViews
        this._modelViews = {};
        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelView(options || {});

        Minionette.View.apply(this, arguments);
    },

    // Listen to the default events.
    collectionEvents: {
        'add': 'addOne',
        'remove': 'removeOne',
        'reset': 'render',
        'sort': 'render'
    },

    // A default useful render function.
    render: function() {
        this.trigger('render:before');

        // Dump all our modelViews.
        // They will be removed by the jQuery#remove
        // listener when we clear $el
        this._modelViews = {};

        var $el = this.$el.html(this.template(this._serialize()));
        // Use a DocumentFragment to speed up #render()
        this.$el = $(document.createDocumentFragment());

        // Loop through all our models, and build their view.
        this.collection.each(this._addModelView, this);

        // Append the DocumentFragment to the rendered template,
        // and set that as this.$el
        this.$el = $el.append(this.$el);

        this.trigger('render');
        return this;
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        this.trigger('addOne:before');

        // Collect the ModelView class.
        var view = this._addModelView(model);

        this.trigger('addOne');
        return view;
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        this.trigger('removeOne:before');

        var view = this._findModelViewByModel(model);
        if (view) { view.remove(); }

        this.trigger('removeOne');
        return view;
    },

    // Add an individual model's view to this.$el.
    _addModelView: function(model) {
        var modelView = new this.ModelView({model: model});

        // Add the modelView, and keep track of it.
        this._modelViews[modelView.cid] = modelView;
        modelView._parent = this;

        this.$el.append(modelView.render().$el);
        return modelView;
    },

    // Find the view associated with a model from our modelViews.
    _findModelViewByModel: function(model) {
        return _.findWhere(this._modelViews, {model: model});
    },

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Backbone.View
    _ensureModelView: function(options) {
        this.ModelView = options.ModelView || this.ModelView || Backbone.View;
    }
});
