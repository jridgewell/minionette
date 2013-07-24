Minionette.Region = function(options) {
    options || (options = {});
    this.cid = _.uniqueId('subview');
    if (options.view) { this.view = options.view; }
    this._ensureView();
};

_.extend(Minionette.Region.prototype, Backbone.Events, {
    //TODO: Comments
    _View: Backbone.View.extend({tagName: 'span'}),

    _ensureView: function() {
        if (!this.view || !(this.view instanceof Backbone.View)) {
            this.view = new this._View();
        }
    },

    render: function() {
        return this.view.render();
    },

    attach: function(view, detach) {
        view = view || (new this._View());

        this.view.$el.after(view.$el).detach();

        if (!detach) {
            this.view.remove();
        }

        return this.view = view;
    },

    remove: function() {
        var v = this.view;

        this.attach();

        return v;
    },

    detach: function() {
        this._detachedView = this.view;
        this.attach(new this._View(), true);

        return this;
    },

    reattach: function() {
        var ret = this.attach(this._detachedView);
        delete this._detachedView;
        return ret;
    }
});
