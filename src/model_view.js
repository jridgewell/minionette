Minionette.ModelView = Minionette.View.extend({
    serializeData: function() {
        return this.model.attributes;
    },

    render: function() {
        _.each(this._subViews, function(view) { view.$el.detach(); });

        this.$el.html(this.template(this.serializeData()));

        this.attachSubViews();

        return this;
    },

    attachSubViews: function() {}
});
