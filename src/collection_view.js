Minionette.CollectionView = Minionette.View.extend({

    // Listen to the default events
    collectionEvents: {
        'add': 'addOne',
        'remove': 'removeOne',
        'reset': 'render'
    },

    render: function() {
        this.$el.html(this.template(this.collection));
        var ModelView = this._getModelView();

        this.collection.each(function(model) {
            this._addModelView(model, ModelView);
        }, this);

        return this;
    },

    addOne: function(model) {
        var ModelView = this._getModelView();
        this._addModelView(model, ModelView);
    },

    removeOne: function(model) {
        var view = this._findSubViewByModel(model);
        this._removeModelView(view);
    },

    _addModelView: function(model, ModelView) {
        var modelView = new ModelView({model: model});
        this._subViews[modelView.cid] = modelView;
        this.$el.append(modelView.render().el);
    },

    _getModelView: function() {
        var ModelView = this.ModelView;
        if (this.options && this.options.ModelView) {
            ModelView = this.option.ModelView;
        }
        return ModelView;
    },

    _removeModelView: function(view) {
        if (view) {
            view.close();
            delete this._subViews[view.cid];
        }
    },

    _findSubViewByModel: function(model) {
        return _.findWhere(this._subViews, {model: model});
    }
});
