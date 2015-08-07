import _ from 'underscore';
import View from './view';
import ModelView from './model_view';

export default View.extend({
    constructor() {
        // Initialize a storage object for our modelViews
        this._modelViews = {};
        this.modelViewsFrag = null;

        View.apply(this, arguments);

        // Ensure this has a ModelView to initialize
        // new modelViews from.
        this._ensureModelViews();

        // Augment #render with our collection specific items.
        this.on('rendered', this._renderModelViews);
    },

    // Listen to the default events.
    collectionEvents() {
        return {
            add: 'addOne',
            remove: 'removeOne',
            reset: 'render',
            sort: 'render'
        };
    },

    // The prefix that will be put on every event triggered
    // by one of the modelViews. So, if a modelView triggers
    // "event", collectionView will trigger "modelView:event"
    // ("event" -> "modelView:event").
    // A falsey value will cause no prefix (or colon) to be
    // used ("event" -> "event").
    modelViewEventPrefix: 'modelView',

    // The same as `modelViewEventPrefix`, except used exclusively
    // for forwarding events from the emptyView.
    emptyViewEventPrefix: 'emptyView',

    ModelView: ModelView,

    // Augment View#render so we can remove our old modelViews.
    render() {
        // Remove all our modelViews after the 'render' event is
        // fired. This is set on #render so that the removing
        // will happen after all other 'render' listeners.
        this.once('render', this._removeModelViews);

        return View.prototype.render.apply(this, arguments);
    },

    // Augment View#remove so we can remove our modelViews.
    remove() {
        // Remove all our modelViews after the 'remove' event is
        // fired. This is set on #remove so that the removing
        // will happen after all other 'remove' listeners.
        this.once('remove', this._removeModelViews);

        return View.prototype.remove.apply(this, arguments);
    },

    // Render all the collection's models as modelViews,
    // using a DocumentFragment to add all modelViews
    // efficiently.
    _renderModelViews() {
        if (this.collection.isEmpty()) {
            return this._renderEmptyView();
        }

        this.modelViewsFrag = this.buildDocumentFragment();

        // Loop through all our models, and build their view.
        const modelViews = this.collection.map(this.addOne, this);

        if (this.modelViewsFrag) {
            this.appendModelViewFrag(this.modelViewsFrag);

            _.each(modelViews, (view) => {
                this.trigger('addedOne', view, this);
            });

            this.modelViewsFrag = null;
        }
    },

    // Add the empty view to this.$el, if the
    // EmptyView constructor is present.
    _renderEmptyView() {
        if (!this.EmptyView || this.emptyView || !this.collection.isEmpty()) {
            return;
        }

        const view = this.emptyView = this.buildEmptyView();
        this._forwardEvents(view, 'emptyViewEventPrefix');
        this.appendModelView(view.render());
    },

    // An override-able method to append a modelView to this
    // collectionView's element.
    appendModelView(view) {
        this.$el.append(view.$el);
    },

    // An override-able method to append a collection of modelView
    // elements (inside a document fragment) to this collectionView's
    // elements at once.
    appendModelViewToFrag(view) {
        this.modelViewsFrag.appendChild(view.el);
    },

    // An override-able method to append a modelView to an efficient
    // DOM element store (a document fragment).
    appendModelViewFrag(frag) {
        this.$el.append(frag);
    },

    // Add an individual model's view to this.$el.
    addOne(model) {
        this._removeEmptyView();

        const view = this.buildModelView(model);

        // Setup event forwarding
        this._forwardEvents(view, 'modelViewEventPrefix');

        // Add the modelView, and keep track of it.
        this._modelViews[model.cid] = view;

        this.trigger('addOne', view, this);
        view.render();

        if (this.modelViewsFrag) {
            this.appendModelViewToFrag(view);
        } else {
            this.appendModelView(view);
            this.trigger('addedOne', view, this);
        }

        return view;
    },

    // An override-able method to construct a new
    // modelView.
    buildModelView(model) {
        return new this.ModelView({ model: model });
    },

    // An override-able method to construct a new
    // documentFragment. Return false to prevent
    // its use, meaning a render will append all the
    // collection's modelViews individually.
    buildDocumentFragment() {
        // Use a DocumentFragment to speed up #render
        return document.createDocumentFragment();
    },

    // An override-able method to construct a new
    // emptyView.
    buildEmptyView() {
        return new this.EmptyView();
    },

    // Remove an individual model's view from this.$el.
    removeOne(model) {
        const view = this._modelViews[model.cid];

        if (view) {
            this.trigger('removeOne', view, this);

            view.remove();

            this.trigger('removedOne', view, this);
        }

        this._renderEmptyView();

        return view;
    },

    // A hook method that is called during
    // a view#remove.
    _removeView(view) {
        view.off('all', this._forwardEvents, this);
        view.off('removed', this._removeView, this);

        const cid = view.model && view.model.cid;
        if (cid in this._modelViews) {
            this._modelViews[cid] = null;
        }
    },

    // A callback method bound to the 'remove:before'
    // event. Removes all our modelViews.
    _removeModelViews() {
        this._removeEmptyView();
        _.invoke(this._modelViews, 'remove');
        this._modelViews = {};
    },

    // Removes the emptyView, if it exists.
    _removeEmptyView() {
        if (this.emptyView) {
            this.emptyView.remove();
            this.emptyView = null;
        }
    },

    // Sets this.ModelView. Prioritizes instantiated options.ModelView,
    // then a subclass' prototype ModelView, and defaults to Minionette.ModelView
    _ensureModelViews() {
        let mv = this.ModelView;
        if (!_.isFunction(mv)) {
            mv = ModelView.extend(mv);
        }
        this.ModelView = mv;

        let ev = this.EmptyView;
        if (ev && !_.isFunction(ev)) {
            ev = View.extend(ev);
        }
        this.EmptyView = ev;
    },

    // Since CollectionView is meant to be largely automated,
    // setup event forwarding from modelViews. That way,
    // you only need to listen to events that happen on
    // this collectionView, not on all the modelViews.
    _forwardEvents(view, prefixer) {
        const forwardEvents = (...args) => {
            const prefix = _.result(this, prefixer);
            if (prefix) {
                args[0] = `${prefix}:${args[0]}`;
            }

            args.push(view);
            this.trigger.apply(this, args);
        };
        forwardEvents._callback = this._forwardEvents;
        view.on('all', forwardEvents);
        view.on('removed', this._removeView, this);
    }
});
