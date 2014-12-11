import _ from 'underscore';
import Backbone from 'backbone';

class Model extends Backbone.Model {
    // Find any computed property functions,
    // if they have not been cached already when instantiating
    // a prior instance.
    constructor(attributes, options) {
        if (!this._computedProperties) {
            this._findComputedProperties();
        }
        super(attributes, options);
    }

    // Model's constructor will call #set before calling #initialize.
    // Wrapping set allows us to set the normal attributes, then the
    // computed attributes before #initialize is called.
    set(key, val, options) {
        var ret = super(key, val, options);

        if (!this._initializedComputedProperties) {
            var computedProps = this._initComputedProperties();
            this.set(computedProps, options || val);
        }
        return ret;
    }

    toJSON() {
        return _.omit(this.attributes, this._computedProperties);
    }

    // Finds all computed property functions. Attempts to cache
    // the associated property names on the prototype, falling back
    // to this instance.
    _findComputedProperties() {
        var ptype = _.result(this.constructor, 'prototype') || this;
        var computedProps = [];

        for (var prop in this) {
            var fn = this[prop];
            if (_.isFunction(fn) && fn._dependentKeys) {
                computedProps.push(prop);
            }
        }
        ptype._computedProperties = computedProps;
    }

    // Sets up event listeners for each computed property,
    // and gets the property's original value.
    _initComputedProperties() {
        this._initializedComputedProperties = true;
        return _.reduce(this._computedProperties, function(memo, prop) {
            this._listenToComputedDependencies(prop);
            memo[prop] = this[prop]();
            return memo;
        }, {}, this);
    }

    // Sets up the event listeners for each computed property's
    // dependencies
    _listenToComputedDependencies(prop) {
        var fn = this[prop];
        var dependencies = fn._dependentKeys;
        var updater = function() {
            this.set(prop, this[prop]());
        };

        _.each(dependencies, function(dependency) {
            this.on('change:' + dependency, updater, this);
        }, this);
    }
}

Model.extend = Backbone.Model.extend;

export default Model;
