// A helper function that specifies a function's dependent model attributes.
// When used in conjunction with Minionette.Model, any time a dependency
// is updated, the computing function is called. The corresponding model
// attribute will be updated with the returned value.
Minionette.Computed = rest(function(dependencies) {
    var fn = dependencies.pop();

    if (!_.every(dependencies, _.isString)) {
        throw new TypeError('Minionette.Computed must be called with dependent keys.');
    }
    if (!_.isFunction(fn)) {
        throw new TypeError('Minionette.Computed must be called with computing function.');
    }

    fn._dependentKeys = dependencies;
    return fn;
});
