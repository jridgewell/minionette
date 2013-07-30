//TODO: Comments
Minionette.Region = function(options) {
    this.cid = _.uniqueId('subview');
    if (options && options.view) { this.view = options.view; }
    this._ensureView();
};

Minionette.Region.extend = Backbone.View.extend;

_.extend(Minionette.Region.prototype, Backbone.Events, {
    _View: Backbone.View.extend({
        tagName: 'span',
        attributes: function() {
            return {'data-cid': this.cid};
        }
    }),

    _ensureView: function() {
        this._view = (new this._View());
        if (!(this.view instanceof Backbone.View)) {
            this.view = this._view;
        }
        this._assignParent(this.view);
    },

    reset: function() {
        this.attach(this._view);
    },

    render: function() {
        return this.view.render();
    },

    attach: function(view) {
        this._assignParent(view);

        this.view.$el.after(view.$el);
        this.view.$el.detach();

        this.view = view;

        return view;
    },

    remove: function() {
        var oldView = this.view;

        this.reset();
        oldView.remove();

        return oldView;
    },

    detach: function() {
        this._detachedView = this.view;
        this.reset();

        return this;
    },

    reattach: function() {
        if (!this._detachedView) { return; }
        var $context = (this._parent && this._parent.$el) || Backbone.$(document.body),
            viewSelector = '[data-cid=' + this.view.cid + ']',
            newView = this._detachedView;

        $context.find(viewSelector).replaceWith(newView.$el);

        delete this._detachedView;
        this.view = newView;

        return newView;
    },

    _removeView: function(view) {
        if (this.view === view) {
            this.reset();
        }
    },

    _assignParent: function(view) {
        view._parent = this;
    }
});
