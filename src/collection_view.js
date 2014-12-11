import _ from 'underscore';
import Backbone from 'backbone';
import View from 'view';
import ModelView from 'model_view';

class CollectionView extends View {
    constructor(options) {
        // Initialize a storage object for our modelViews
        this._modelViews = {};

        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelView(options || {});

        super(options);

        // Augment #render() with our collection specific items.
        this.on('rendered', this._renderModelViews);
        // Make sure we remove our modelViews when this is removed.
        this.on('removed', this._removeModelViews);
    }

    // A default useful render function.
    render() {
        // Remove all our modelViews after the 'render' event is
        // fired. This is set on #render() so that the removing
        // will happen after all other 'render' listeners.
        this.once('render', function() {
            // Empty the entire $el, that way each individual
            // modelView removal won't trigger a DOM reflow.
            this.$el.empty();
            this._removeModelViews();
        }, this);

        return Minionette.View.prototype.render.apply(this);
    }

    _renderModelViews() {
        // Use a DocumentFragment to speed up #render()
        var frag = new Backbone.View({el: document.createDocumentFragment()});

        // Override `appendModelView()` for the time being.
        // This is so we can append directly to the DocumentFragment,
        // and then append it all at once later.
        var appendModelView = this.appendModelView;
        this.appendModelView = function(view) { frag.el.appendChild(view.el); };

        // Loop through all our models, and build their view.
        this.collection.each(this.addOne, this);

        // Append the DocumentFragment to the rendered template,
        // and set `appendModelView()` back to normal.
        this.appendModelView = appendModelView;
        this.appendModelView(frag);
    }

    appendModelView(view) {
        this.$el.append(view.$el);
    }

    // Add an individual model's view to this.$el.
    addOne(model) {
        var view = this.buildModelView(model);

        // Setup event forwarding
        this._forwardEvents(view);

        // Add the modelView, and keep track of it.
        this._modelViews[model.cid] = view;
        view._parent = this;

        this.trigger('addOne', view, this);

        this.appendModelView(view.render());

        this.trigger('addedOne', view, this);

        return view;
    }

    // An override-able method to construct a new
    // modelView.
    buildModelView(model) {
        return new this.ModelView({model: model});
    }

    // Remove an individual model's view from this.$el.
    removeOne(model) {
        var view = this._modelViews[model.cid];

        if (view) {
            this.trigger('removeOne', view, this);
            view.remove();
            this.trigger('removedOne', view, this);
            this.stopListening(view);
        }

        return view;
    }

    // A hook method that is called during
    // a view#remove().
    _removeView(view) {
        delete this._modelViews[view.model.cid];
    }

    // A callback method bound to the 'remove:before'
    // event. Removes all our modelViews.
    _removeModelViews() {
        _.invoke(this._modelViews, 'remove');
    }

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
    _ensureModelView(options) {
        var mv = options.ModelView || this.ModelView || {};
        if (!_.isFunction(mv)) {
            mv = Minionette.ModelView.extend(mv);
        }
        this.ModelView = mv;
    }

    // Since CollectionView is meant to be largely automated,
    // setup event forwarding from modelViews. That way,
    // you only need to listen to events that happen on
    // this collectionView, not on all the modelViews.
    _forwardEvents(view) {
        this.listenTo(view, 'all', function() {
            var args = _.toArray(arguments);
            var prefix = _.result(this, 'modelViewEventPrefix');
            prefix = (prefix) ? prefix + ':' : '';

            args[0] = prefix + args[0];
            args.push(view);

            this.trigger.apply(this, args);
        });
    }
}

CollectionView.extend = View.extend;

_.extend(CollectionView.prototype, {
    // Listen to the default events.
    collectionEvents: {
        add: 'addOne',
        remove: 'removeOne',
        reset: 'render',
        sort: 'render'
    },

    // The prefix that will be put on every event triggered
    // by one of the modelViews. So, if a modelView triggers
    // "event", collectionView will trigger "modelView:event"
    // ("event" -> "modelView:event").
    // A falsey value will cause no prefix (or colon) to be
    // used ("event" -> "event").
    modelViewEventPrefix: 'modelView',

    ModelView: ModelView
});

export default CollectionView;
