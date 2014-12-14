// A helper function, similar to _.result
// that will call the property on obj, unless obj
// is undefined or null. Passes the 3rd param
// as arguments to the method.
function attempt(obj, property, args) {
    // Return undefined unless obj
    // is not null or undefined
    if (obj == null) { return void 0; }
    var prop = obj[property];

    if (_.isFunction(prop)) {
        var apply = _.isArray(args);
        return apply ? prop.apply(obj, args) : obj[property](args);
    }
}
