// A helper function that specifies a function's dependent model attributes.
// When used in conjunction with Minionette.Model, any time a dependency
// is updated, the computing function is called. The corresponding model
// attribute will be updated with the returned value.
Minionette.Computed = function() {
    var dependencies = _.initial(arguments);
    var fn = _.last(arguments);

    if (!_.every(dependencies, _.isString)) {
        throw new TypeError('Minionette.Computed must be called with dependent keys.');
    }
    if (!_.isFunction(fn)) {
        throw new TypeError('Minionette.Computed must be with a computing function as last parameter.');
    }

    fn._dependentKeys = dependencies;
    return fn;
};
