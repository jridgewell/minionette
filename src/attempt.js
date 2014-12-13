// A helper function, similar to _.result
// that will return the property on obj, unless obj
// is undefined or null. Passes the 3rd params
// as arguments to the property, if it is a method
function attempt(obj, property, args) {
    // Return undefined unless obj
    // is not null or undefined
    if (obj == null) { return void 0; }
    var prop = obj[property];

    if (_.isFunction(prop)) {
        var length = (args) ? args.length : 0;

        switch (length) {
            case -1: return obj[property](args);
            case 0: return obj[property]();
            case 1: return obj[property](args[0]);
            case 2: return obj[property](args[0], args[1]);
            case 3: return obj[property](args[0], args[1], args[2]);
            default: return prop.apply(obj, args);
        }
    }
    return prop;
}
