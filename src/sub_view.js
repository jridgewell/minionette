Minionette.Region = function(options) {
    this.cid = _.uniqueId('subview');
    this._ensureView();
    this._configure(options || {});
};

_.extend(Minionette.Region.prototype, Backbone.Events, {
    //TODO: Comments
    _View: Backbone.View.extend({tagName: 'span'}),

    _configure: function(options) {
        if (options.view) { this.view = options.view; }
    },

    _ensureView: function() {
        if (!this.view || !(this.view instanceof Backbone.View)) {
            this.view = new this._View();
        }
    },

    render: function() {
        return this.view.render();
    },

    attach: function(view) {
        view = view || (new this._View());
        var v = this.view;

        this.view.$el.replaceWith(view.el);
        v.remove();

        return this.view = view;
    },

    remove: function() {
        var v = this.view;

        this.attach();

        return v;
    }
});
