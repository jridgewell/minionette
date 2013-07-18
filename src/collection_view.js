Minionette.CollectionView = Minionette.View.extend({
    constructor: function(options) {
        Minionette.View.apply(this, arguments)
        this._listenEvents();
    },

    template: function() { return '' },

    setElement: function() {
        Minionette.View.prototype.setElement.apply(this, arguments);
        this.$whereToAdd = this.$(this.options.whereToAdd)[0] ||
            this.$(this.whereToAdd)[0] || this.$el;
    },

    render: function() {
        this.$el.html(this.template(this.collection));
        var ModelView = this._getModelView();

        this.collection.each(function(model) {
            this._addModelView(model, ModelView);
        }, this);

        return this;
    },

    // Handle a model added to the collection
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
        this.$whereToAdd.append(modelView.render().el);
    },

    _getModelView: function() {
        var ModelView = this.ModelView;
        if (this.options && this.options.ModelView) {
            ModelView = this.option.ModelView;
        }
        return ModelView;
    },

    // Configured the initial events that the collection view
    // binds to. Override this method to prevent the initial
    // events, or to add your own initial events.
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
