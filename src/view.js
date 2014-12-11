import _ from 'underscore';
import Backbone from 'backbone';
import attempt from 'attempt';
import Region from 'region';

class View extends Backbone.View {
    constructor(options) {
        // Pick out a few initializing options
        _.extend(this, _.pick(options || {}, 'regions', 'Region', 'template', 'ui'));

        // Initialize our regions object
        this._regions = {};

        super(options);

        // Add the regions
        // This is done _after_ calling Backbone.View's constructor,
        // so that this.$el will be defined when we bind selectors.
        this.addRegions(_.result(this, 'regions'));

        // Have the view listenTo the model and collection.
        this._listenToEvents(this.model, _.result(this, 'modelEvents'));
        this._listenToEvents(this.collection, _.result(this, 'collectionEvents'));

        // Always bind this._viewHelper to this.
        // This._viewHelper will be passed into
        // the template as a helper method for
        // rendering regions.
        _.bindAll(this, '_viewHelper');
    }

    // A default template that will clear this.$el.
    // Override this in a subclass to something useful.
    template() { return ''; }

    // A default function that will have it's return passed
    // to this.template
    // Override this in a subclass to something useful.
    serialize() { return {}; }

    // The actual "serialize" that is fed into the this.template.
    // Used so a subclass can override this.serialize and still
    // have the `view` helper.
    _serialize() {
        return _.extend({view: this._viewHelper}, this.serialize());
    }

    // A useful remove method that triggers events.
    remove() {
        this.trigger('remove', this);

        this._removeFromParent();
        _.invoke(this._regions, 'remove');
        super();

        this.trigger('removed', this);
        return this;
    }

    // A useful default render method.
    render() {
        this.trigger('render', this);

        // Detach all our regions, so they don't need to be re-rendered.
        _.invoke(this._regions, 'detach');

        var template = this.template;
        var html = _.isFunction(template) ? this.template(this._serialize()) : template;
        this.$el.html(html);
        this._addUIElements();

        // Reattach all our regions
        _.invoke(this._regions, 'reattach');

        this.trigger('rendered', this);
        return this;
    }

    // Adds the region "name" to this as this[name].
    // Also attaches it to this._regions[name], for
    // internal management.
    addRegion(name, view) {
        // Remove the old region, if it exists already
        _.result(this._regions[name], 'remove');

        var options = { cid: name };
        // If this is a Backbone.View, pass that as the
        // view to the region.
        if (!view || view.$el) {
            options.view = view;
        } else {
            // If view is a selector, find the DOM element
            // that matches it.
            options.selector = _.result(view, 'selector') || view;
            options.el = this.$(view);
        }

        var region = new this.Region(options);

        region._parent = this;
        this[region.cid] = this._regions[region.cid] = region;

        return region;
    }

    // Adds multiple regions to the view. Takes
    // an object with {regioneName: view} syntax
    addRegions(regions) {
        _.each(regions, function(view, name) {
            this.addRegion(name, view);
        }, this);
        return this;
    }

    // A remove helper to remove this view from it's parent
    _removeFromParent() {
        // Remove this view from _parent, if it exists
        attempt(this._parent, '_removeView', [this]);
    }

    _removeRegion(region) {
        delete this[region.cid];
        delete this._regions[region.cid];
    }

    // Loop through the events given, and listen to
    // entity's event.
    _listenToEvents(entity, events) {
        if (!entity) { return; }
        _.each(events, function(method, event) {
            if (!_.isFunction(method)) { method = this[method]; }
            this.listenTo(entity, event, method);
        }, this);
    }

    _addUIElements() {
        _.each(_.result(this, 'ui'), function(selector, name) {
            this['$' + name] = this.$(selector);
        }, this);
    }

    // A helper that is passed to #template() that will
    // render regions inline.
    _viewHelper(name) {
        var region = this._regions[name] || this.addRegion(name);
        var el = region.view.el;
        if (el) {
            return el.outerHTML;
        }
        return '';
    }
}

View.extend = Backbone.View.extend;

View.prototype.Region = Region;

export default View;
