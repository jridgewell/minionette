Minionette.SubView = function(options) {
    this.cid = _.uniqueId('subview');
    this._ensureView();
    this._configure(options || {});
    this.initialize.apply(this, arguments);
};

_.extend(Minionette.SubView.prototype, Backbone.Events, {
    initialize: function() {},

    _view: new Backbone.View({tagName: 'span'}),

    _configure: function(options) {
        if (options.view) { this.view = options.view; }
    },

    _ensureView: function() {
        if (!this.view || !(this.view instanceof Backbone.View)) {
            this.view = this._view;
        }
    },

    render: function() {
        return this.view.render();
    },

    attach: function(view) {
        var v = this.view;

        this.view.$el.replaceWith(view.el);
        v.remove();

        return this.view = view;
    },

    remove: function() {
        var v = this.view;

        this.attach(this._view);

        return v;
    }
});
