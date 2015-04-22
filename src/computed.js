// A helper function that specifies a function's dependent model attributes.
// When used in conjunction with Minionette.Model, any time a dependency
// is updated, the computing function is called. The corresponding model
// attribute will be updated with the returned value.
Minionette.Computed = rest(function(dependencies) {
    var config = dependencies.pop();

    if (!_.every(dependencies, _.isString)) {
        throw new TypeError('Minionette.Computed must be called with dependent keys.');
    }
    if (!_.isObject(config) || !_.isFunction(config.get)) {
        throw new TypeError('Minionette.Computed must be called with config object `{ get: getter [, set: setter ] }`');
    }

    var getter = config.get;


    getter._dependentKeys = dependencies;
    if (_.isFunction(config.set)) {
        getter._setter = config.set;
    }

    return getter;
});
