import _ from 'underscore';
import Backbone from 'backbone';

// Use getOwnPropertyNames in ES6 environments,
// since it'll grab non-enumerable class methods.
// In older environments, just use _.keys since
// they don't have ES6 classes anyways.
var getOwn = Object.getOwnPropertyNames || _.keys;

export default Backbone.Model.extend({
    constructor: function() {
        if (!this._computedProperties) {
            this.constructor._findComputedProperties();
        }

        Backbone.Model.apply(this, arguments);
    },

    // Model's constructor will call #set before calling #initialize.
    // Wrapping #set allows us to set the normal attributes, then the
    // computed attributes before #initialize is called.
    set: function() {
        var ret = Backbone.Model.prototype.set.apply(this, arguments);

        if (!this._initializedComputedProperties) {
            this._initComputedProperties();
        }
        return ret;
    },

    // Omit the computed properties from our JSON POSTs.
    toJSON: function() {
        return _.omit(this.attributes, this._computedProperties);
    },

    // Sets up event listeners for each computed property,
    // and gets the property's original value.
    _initComputedProperties: function() {
        this._initializedComputedProperties = true;
        _.each(this._computedProperties, this._listenToComputedDependencies, this);
    },

    // Sets up the event listeners for each computed property's
    // dependencies
    _listenToComputedDependencies: function(prop) {
        var getter = this[prop];
        var dependencies = getter._dependentKeys;

        var onDependencyChange = function(model) {
            var value = getter.apply(model, _.map(dependencies, model.get, model));
            model.set(prop, value);
        };
        _.each(dependencies, function(dependency) {
            this.on('change:' + dependency, onDependencyChange);
        }, this);
        onDependencyChange(this);
    }

}, {
    // Finds all computed property functions. Caches
    // the associated property names on the prototype.
    _findComputedProperties: function() {
        var proto = this.prototype;
        var props = getOwn(proto);
        var computedProps = _.filter(props, function(prop) {
            var fn = proto[prop];
            return _.isFunction(fn) && fn._dependentKeys;
        });
        proto._computedProperties = computedProps;
    }
});
