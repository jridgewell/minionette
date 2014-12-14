Minionette.Model = Backbone.Model.extend({
    // Find any computed property functions,
    // if they have not been cached already when instantiating
    // a prior instance.
    constructor: function() {
        if (!this._computedProperties) {
            this._findComputedProperties();
        }
        Backbone.Model.apply(this, arguments);
    },

    // Model's constructor will call #set before calling #initialize.
    // Wrapping set allows us to set the normal attributes, then the
    // computed attributes before #initialize is called.
    set: function(key, val, options) {
        var keys = _.isObject(key) ? _.keys(key) : [key];
        keys = _.intersection(keys, this._dependentKeys);

        this._listenToChangingDependencies(keys);

        var ret = Backbone.Model.prototype.set.apply(this, arguments);

        if (!this._initializedComputedProperties) {
            var computedProps = this._initComputedProperties();
            this.set(computedProps, options || val);
        }
        return ret;
    },

    toJSON: function() {
        return _.omit(this.attributes, _.keys(this._computedProperties));
    },

    // Finds all computed property functions. Attempts to cache
    // the associated property names on the prototype, falling back
    // to this instance.
    _findComputedProperties: function() {
        var ptype = _.result(this.constructor, 'prototype') || this;
        var computedProps = {};
        var dependentKeys = [];
        var dependencies;

        for (var prop in this) {
            var fn = this[prop];
            if (_.isFunction(fn) && (dependencies = fn._dependentKeys)) {
                computedProps[prop] = dependencies;
                dependentKeys = dependentKeys.concat(dependencies);
            }
        }

        ptype._computedProperties = computedProps;
        ptype._dependentKeys = _.uniq(dependentKeys);
    },

    // Sets up event listeners for each computed property,
    // and gets the property's original value.
    _initComputedProperties: function() {
        this._initializedComputedProperties = true;
        var props = _.keys(this._computedProperties);
        return _.reduce(props, function(memo, prop) {
            memo[prop] = this[prop]();
            return memo;
        }, {}, this);
    },

    // Sets up the event listeners for each computed property's
    // dependencies
    _listenToChangingDependencies: function(keys) {
        _.each(this._computedProperties, function(deps, prop) {
            deps = _.intersection(keys, deps);
            if (deps.length) {
                var times = deps.length;
                var events = 'change:' + deps.join(' change:');

                this.on(events, function updater() {
                    // Defer until we are at the last property change.
                    if (--times) { return; }
                    this.off(events, updater);
                    this.set(prop, this[prop]());
                });
            }
        }, this);

    }
});
