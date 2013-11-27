// A helper function, similar to _.result
// that will return the property on obj, unless obj
// is undefined or null. Passes the 3rd+ params
// as arguments to the property, if it is a method
function attempt(obj, property) {
    // Return undefined unless obj
    // is not null or undefined
    if (obj == null) { return void 0; }
    var prop = obj[property];

    if (_.isFunction(prop)) {
        // Grab the 3rd+ params
        var args = _.rest(arguments, 2);

        // Call the method, as obj, with the
        // additional params
        return prop.apply(obj, args);
    }
    return prop;
}
