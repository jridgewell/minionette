Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        Minionette.View.apply(this, arguments);

        // Listen to the default events
        this._listenEvents();
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

    _listenEvents: function() {
        if (this.collection){
            this.listenTo(this.collection, "add", this.addOne, this);
            this.listenTo(this.collection, "remove", this.removeOne, this);
            this.listenTo(this.collection, "reset", this.render, this);
        }
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
