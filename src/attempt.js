// A helper function, similar to _.result
// that will call the prop on obj, unless obj
// is undefined or null. Passes the 3rd param
// as arguments to the method.
function attempt(obj, prop, args, precheck) {
    // Return undefined unless obj
    // is not null or undefined
    if (obj == null) { return; }
    var fn = obj[prop];

    if (precheck || _.isFunction(fn)) {
        var apply = _.isArray(args);
        return apply ? fn.apply(obj, args) : fn(args);
    }
}
