Minionette.CollectionView = Minionette.View.extend({

    // The View class to render the collection as.
    ModelView: Backbone.View,

    // Listen to the default events.
    collectionEvents: {
        'add': 'addOne',
        'remove': 'removeOne',
        'reset': 'render'
    },

    // A default useful render function.
    render: function() {
        this.trigger('render:before');

        this.$el.html(this.template(this.collection));

        // Collect the ModelView class.
        var ModelView = this._getModelView();

        // Loop through all our models, and build their view.
        this.collection.each(function(model) {
            this._addModelView(model, ModelView);
        }, this);

        this.trigger('render');
        return this;
    },

    // Add an individual model's view to this.$el.
    addOne: function(model) {
        this.trigger('addOne:before');

        // Collect the ModelView class.
        var ModelView = this._getModelView();
        this._addModelView(model, ModelView);

        this.trigger('addOne');
    },

    // Remove an individual model's view from this.$el.
    removeOne: function(model) {
        this.trigger('removeOne:before');

        var view = this._findSubViewByModel(model);
        if (view) { view.remove(); }

        this.trigger('removeOne');
    },

    // Add an individual model's view to this.$el.
    _addModelView: function(model, ModelView) {
        var modelView = new ModelView({model: model});

        // Add this view to our subviews, so we can remove
        // them later.
        this._subViews[modelView.cid] = modelView;
        modelView._parentView = this;

        this.$el.append(modelView.render().el);
    },

    // Find the correct ModelView to use.
    // Prioritizes the one passed at initialization.
    _getModelView: function() {
        var ModelView = this.ModelView;
        if (this.options && this.options.ModelView) {
            ModelView = this.option.ModelView;
        }
        return ModelView;
    },

    // Find the view associated with a model from our subviews.
    _findSubViewByModel: function(model) {
        return _.findWhere(this._subViews, {model: model});
    }
});
